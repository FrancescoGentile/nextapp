//
//
//

import EventEmitter from 'eventemitter3';
import { ServiceAccount } from 'firebase-admin';
import { Driver } from 'neo4j-driver';
import { EmailSender } from '../domain/ports/email.sender';
import { EventBroker } from '../domain/ports/event.broker';
import { InfoRepository } from '../domain/ports/info.repository';
import { NotificationSender } from '../domain/ports/notification.sender';
import { EventBrokerEmitter } from './broker/emitter';
import { MailgunEmailSender } from './email/mailgun';
import { FCMNotificationSender } from './notification/firebase';
import { Neo4jInfoRepository } from './repository/info';

export interface InfrastructureConfig {
  driver: Driver;
  emitter: EventEmitter;
  key: string;
  domain: string;
  account: ServiceAccount;
}

export async function init_infrastructure(
  config: InfrastructureConfig
): Promise<{
  info_repo: InfoRepository;
  broker: EventBroker;
  email_sender: EmailSender;
  notification_sender: NotificationSender;
}> {
  const info_repo = await Neo4jInfoRepository.create(config.driver);
  const broker = new EventBrokerEmitter(config.emitter);
  const email_sender = new MailgunEmailSender(config.key, config.domain);
  const notification_sender = new FCMNotificationSender(config.account);

  return { info_repo, broker, email_sender, notification_sender };
}
