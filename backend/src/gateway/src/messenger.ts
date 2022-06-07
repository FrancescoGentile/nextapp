//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { init_services } from '@nextapp/messenger/service';
import { init_rest_api } from '@nextapp/messenger/restapi';
import { init_infrastructure } from '@nextapp/messenger/infrastructure';
import express from 'express';

export async function init_messenger_module(
  driver: Driver,
  emitter: EventEmitter,
  mailgun_key: string,
  mailgun_domain: string
): Promise<express.Router> {
  const { info_repo, broker, email_sender, notification_sender } =
    await init_infrastructure(driver, emitter, mailgun_key, mailgun_domain);

  const info_service = init_services(
    info_repo,
    email_sender,
    notification_sender,
    broker
  );

  const router = init_rest_api(info_service);

  return router;
}
