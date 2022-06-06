//
//
//

import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import neo4j, { Driver } from 'neo4j-driver';
import { InternalServerError } from '@nextapp/common/error';
import { EventEmitter } from 'eventemitter3';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import admin from 'firebase-admin';
import fs from 'fs';
import { InvalidEndpoint } from './errors';
import { init_user_module } from './user';
import { init_room_module } from './room';
import { init_messenger_module } from './messenger';

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

function init_firebase_admin() {
  if (admin.apps.length !== 0) {
    return;
  }

  if (process.env.FIREBASE_BUCKET === undefined) {
    throw new InternalServerError('Firebase Bucket not set');
  }

  const file = fs.readFileSync('firebase.json');
  const cert = JSON.parse(file.toString());

  admin.initializeApp({
    credential: admin.credential.cert(cert),
    storageBucket: process.env.FIREBASE_BUCKET,
  });
}

async function init_gateway(): Promise<express.Router> {
  const driver = await get_neo4j();
  const emitter = new EventEmitter();
  init_firebase_admin();

  const router = express.Router();

  if (process.env.JWT_KEY === undefined) {
    throw new InternalServerError('Private Key is not set');
  }

  if (
    process.env.MAILGUN_KEY === undefined ||
    process.env.MAILGUN_DOMAIN === undefined
  ) {
    throw new InternalServerError('Mailgun parameters not set.');
  }

  const { routes, auth_middleware } = await init_user_module(
    driver,
    emitter,
    process.env.JWT_KEY
  );
  const room_routes = await init_room_module(driver, emitter);
  const messenger_routes = await init_messenger_module(
    driver,
    emitter,
    process.env.MAILGUN_KEY,
    process.env.MAILGUN_DOMAIN
  );

  router.use(routes);
  router.use(auth_middleware, room_routes);
  router.use(auth_middleware, messenger_routes);

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

  if (process.env.FRONTEND === undefined) {
    throw new InternalServerError('Frontend server not set.');
  }

  app.use(
    cors({
      origin: [process.env.FRONTEND],
      credentials: true,
    }) as any
  );
  app.use(cookieParser() as any);
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
