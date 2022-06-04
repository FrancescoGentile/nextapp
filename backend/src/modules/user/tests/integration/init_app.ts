/* eslint-disable import/extensions */
//
//
//

import express from 'express';
import { Driver } from 'neo4j-driver';
import EventEmitter from 'eventemitter3';
// eslint-disable-next-line import/no-extraneous-dependencies
import cookieParser from 'cookie-parser';
import fs from 'fs';
import { init_infrastructure } from '../../src/infrastructure';
import { init_services } from '../../src/domain/services';
import { init_rest_api } from '../../src/application/rest';

export async function init_room_module(
  driver: Driver,
  emitter: EventEmitter
): Promise<express.Router> {
  const file = fs.readFileSync(process.env.FIREBASE_FILE!);
  const auth = JSON.parse(file.toString());

  const { repository, storage, broker } = await init_infrastructure(
    driver,
    emitter,
    auth,
    process.env.FIREBASE_BUCKET!
  );
  const { user_service, auth_service } = init_services(
    repository,
    storage,
    process.env.KEY!,
    broker
  );
  const { router } = init_rest_api(user_service, auth_service);

  return router;
}

export async function init_app(driver: Driver, emitter: EventEmitter) {
  const app = express();
  app.use(cookieParser() as any);
  app.use(await init_room_module(driver, emitter));

  return app;
}
