//
//
//

import { InternalServerError } from '@nextapp/common/error';
import {
  SendMessageEvent,
  UserCreatedEvent,
  UserDeletedEvent,
} from '../events';
import { EmailAddress } from '../models/email';
import { EmailSender } from '../ports/email.sender';
import { EventBroker } from '../ports/event.broker';
import { InfoRepository } from '../ports/info.repository';
import { NotificationSender } from '../ports/notification.sender';
import { Notification } from '../models/notification';

export class MessageService {
  public constructor(
    private readonly repo: InfoRepository,
    private readonly email_sender: EmailSender,
    private readonly notification_sender: NotificationSender,
    private readonly broker: EventBroker
  ) {
    this.broker.on_user_created('user_created', this.create_user, this);
    this.broker.on_user_deleted('user_deleted', this.delete_user, this);
    this.broker.on_send_message(
      'send_notification',
      this.send_notification,
      this
    );
  }

  public async create_user(event: UserCreatedEvent): Promise<void> {
    try {
      const email = EmailAddress.from_string(event.email, true);
      const created = this.repo.create_user(event.user_id, email);

      if (!created) {
        throw new InternalServerError();
      }

      await this.email_sender.send_email([email], {
        subject: 'Accoutn created',
        text:
          `Welcome to NextApp\n` +
          `Hi ${event.fullname}, we are happy to have you in the NextApp family.\n` +
          `Your account has been created. Your username is ${event.username} and the temporary password is ${event.password}.\n` +
          `For security reasons, please change it as soon as you can.\n`,
        html:
          `<h1>Welcome to NextApp</h1>` +
          `<p>Hi ${event.fullname}, we are happy to have you in the NextApp family.</p>` +
          `Your account has been created. Your username is ${event.username} and the temporary password is ${event.password}.<p>` +
          `<p>For security reasons, please change it as soon as you can.</p>`,
      });
    } catch {
      // TODO: write log error
    }
  }

  public async delete_user(event: UserDeletedEvent): Promise<void> {
    try {
      const deleted = await this.repo.delete_user(event.user_id);
      if (!deleted) {
        throw new InternalServerError();
      }
    } catch {
      // TODO: write log error
    }
  }

  public async send_notification(event: SendMessageEvent): Promise<void> {
    try {
      const tokens = await this.repo.get_notification_tokens(event.users);
      const notification: Notification = {
        title: event.title,
        body: event.body,
      };
      await this.notification_sender.send_notification(tokens, notification);
    } catch {
      // TODO: write log error
    }
  }
}
