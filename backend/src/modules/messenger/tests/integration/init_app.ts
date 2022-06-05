//
//
//

import express from 'express';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { Driver } from 'neo4j-driver';
import EventEmitter from 'eventemitter3';
import { UserID } from '@nextapp/common/user';
import fs from 'fs';
import { InternalServerError } from '@nextapp/common/error';
import {
  InfrastructureConfig,
  init_infrastructure,
} from '../../src/infrastructure';
import { init_services } from '../../src/domain/services';
import { init_rest_api } from '../../src/application/rest';

export async function init_messenger_module(
  driver: Driver,
  emitter: EventEmitter
): Promise<express.Router> {
  if (
    process.env.FIREBASE_FILE === undefined ||
    process.env.MAILGUN_KEY === undefined ||
    process.env.MAILGUN_DOMAIN === undefined
  ) {
    throw new InternalServerError('missing environment variables');
  }

  const file = fs.readFileSync(process.env.FIREBASE_FILE);
  const auth = JSON.parse(file.toString());

  const config: InfrastructureConfig = {
    driver,
    emitter,
    key: process.env.MAILGUN_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    account: auth,
  };

  const { info_repo, broker, email_sender, notification_sender } =
    await init_infrastructure(config);
  const info_service = init_services(
    info_repo,
    email_sender,
    notification_sender,
    broker
  );
  const router = init_rest_api(info_service);

  return router;
}

function set_user(user_id: UserID) {
  return (request: Request, _: Response, next?: NextFunction) => {
    request.user_id = user_id;
    next!();
  };
}

export async function init_app(driver: Driver, user_id: UserID) {
  const emitter = new EventEmitter();

  const app = express();
  app.use(set_user(user_id));
  app.use(await init_messenger_module(driver, emitter));

  return app;
}
