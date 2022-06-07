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

export async function init_room_module(
  driver: Driver,
  emitter: EventEmitter
): Promise<express.Router> {
  const { user_repo, room_repo, booking_repo, broker } =
    await init_infrastructure(driver, emitter);
  const { room_service, booking_service } = init_services(
    user_repo,
    room_repo,
    booking_repo,
    broker
  );
  const router = init_rest_api(room_service, booking_service);

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
  app.use(await init_room_module(driver, emitter));

  return app;
}
