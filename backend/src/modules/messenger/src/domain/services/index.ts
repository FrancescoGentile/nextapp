//
//
//

import { EmailSender } from '../ports/email.sender';
import { EventBroker } from '../ports/event.broker';
import { InfoRepository } from '../ports/info.repository';
import { UserInfoService } from '../ports/info.service';
import { NotificationSender } from '../ports/notification.sender';
import { NextUserInfoService } from './info';
import { MessageService } from './message';

export function init_services(
  info_repo: InfoRepository,
  email_sender: EmailSender,
  notification_sender: NotificationSender,
  broker: EventBroker
): UserInfoService {
  const info_service = new NextUserInfoService(info_repo);

  // initialize message service
  const _ = new MessageService(
    info_repo,
    email_sender,
    notification_sender,
    broker
  );

  return info_service;
}
