//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { init_services } from '@nextapp/channel/service';
import { init_rest_api } from '@nextapp/channel/restapi';
import { init_infrastructure } from '@nextapp/channel/infrastructure';
import express from 'express';

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
