//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { EmailSender } from '../domain/ports/email.sender';
import { EventBroker } from '../domain/ports/event.broker';
import { InfoRepository } from '../domain/ports/info.repository';
import { NotificationSender } from '../domain/ports/notification.sender';
import { EventBrokerEmitter } from './broker/emitter';
import { MailgunEmailSender } from './email/mailgun';
import { FCMNotificationSender } from './notification/firebase';
import { Neo4jInfoRepository } from './repository/info';

export async function init_infrastructure(
  driver: Driver,
  emitter: EventEmitter,
  key: string,
  domain: string
): Promise<{
  info_repo: InfoRepository;
  broker: EventBroker;
  email_sender: EmailSender;
  notification_sender: NotificationSender;
}> {
  const info_repo = await Neo4jInfoRepository.create(driver);
  const broker = new EventBrokerEmitter(emitter);
  const email_sender = new MailgunEmailSender(key, domain);
  const notification_sender = new FCMNotificationSender();

  return { info_repo, broker, email_sender, notification_sender };
}
