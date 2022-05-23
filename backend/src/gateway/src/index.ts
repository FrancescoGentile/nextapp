//
//
//

import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import neo4j, { Driver } from 'neo4j-driver';
import { InternalServerError } from '@nextapp/common/error';
import { EventEmitter } from 'eventemitter3';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { InvalidEndpoint } from './errors';
import { init_user_module } from './user';

async function get_neo4j(): Promise<Driver> {
  const url = process.env.NEO4J_URL;
  const username = process.env.NEO4J_USERNAME;
  const pwd = process.env.NEO4J_PWD;
  if (url === undefined || username === undefined || pwd === undefined) {
    throw new InternalServerError('Missing Neo4J parameters.');
  }

  const driver = neo4j.driver(url, neo4j.auth.basic(username, pwd));
  try {
    await driver.verifyConnectivity();
  } catch {
    throw new InternalServerError('It was not possible to connect to Neo4J.');
  }

  return driver;
}

async function init_gateway(): Promise<express.Router> {
  const driver = await get_neo4j();
  const emitter = new EventEmitter();

  const router = express.Router();
  router.use(cookieParser() as any);

  if (process.env.KEY === undefined) {
    throw new InternalServerError('Private Key is not set');
  }

  const { routes, auth_middleware } = await init_user_module(driver, emitter, process.env.KEY);

  router.use(routes);

  return router;
}

function invalid_endpoint(request: Request, response: Response) {
  const error = new InvalidEndpoint(request.url);
  error.instance = request.url;
  response.status(error.code).json(error);
}

async function start_server(port: number) {
  const router = await init_gateway();
  const app = express();

  app.use(router);
  app.use(invalid_endpoint);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

async function main() {
  const port = Number.parseInt(
    process.env.PORT ? process.env.PORT : '8080',
    10
  );

  await start_server(port);
}

main()
  .then()
  // eslint-disable-next-line no-console
  .catch((e) => console.log(e));
