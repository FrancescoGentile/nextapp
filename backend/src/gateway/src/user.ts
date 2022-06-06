//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { init_services } from '@nextapp/user/service';
import { AuthMiddleware, init_rest_api } from '@nextapp/user/restapi';
import { init_infrastructure } from '@nextapp/user/infrastructure';
import express from 'express';

export async function init_user_module(
  driver: Driver,
  emitter: EventEmitter,
  key: string
): Promise<{
  routes: express.Router;
  auth_middleware: AuthMiddleware;
}> {
  const { repository, broker, storage } = await init_infrastructure(
    driver,
    emitter
  );
  const { user_service, auth_service } = init_services(
    repository,
    storage,
    key,
    broker
  );
  const { router, auth_middleware } = init_rest_api(user_service, auth_service);

  return { routes: router, auth_middleware };
}
