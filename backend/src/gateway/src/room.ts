//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { init_services } from '@nextapp/room/service';
import { init_rest_api } from '@nextapp/room/restapi';
import { init_infrastructure } from '@nextapp/room/infrastructure';
import express from 'express';

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

