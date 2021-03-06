//
//
//

import express from 'express';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { Driver } from 'neo4j-driver';
import EventEmitter from 'eventemitter3';
import { UserID } from '@nextapp/common/user';
import { init_infrastructure } from '../../src/infrastructure';
import { init_services } from '../../src/domain/services';
import { init_rest_api } from '../../src/application/rest';

export async function init_channel_module(
  driver: Driver,
  emitter: EventEmitter
): Promise<express.Router> {
  const {
    user_repo,
    channel_repo,
    sub_repo,
    news_repo,
    event_repo,
    cache,
    broker,
  } = await init_infrastructure(driver, emitter);
  const { channel_service, sub_service, news_service, event_service } =
    init_services(
      user_repo,
      channel_repo,
      sub_repo,
      news_repo,
      event_repo,
      cache,
      broker
    );
  const router = init_rest_api(
    channel_service,
    sub_service,
    news_service,
    event_service
  );

  return router;
}

function set_user(user_id: UserID) {
  return (request: Request, _: Response, next?: NextFunction) => {
    request.user_id = user_id;
    next!();
  };
}

export async function init_app(
  driver: Driver,
  emitter: EventEmitter,
  user_id: UserID
) {
  const app = express();
  app.use(set_user(user_id));
  app.use(await init_channel_module(driver, emitter));

  return app;
}
