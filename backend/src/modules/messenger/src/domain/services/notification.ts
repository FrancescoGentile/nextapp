//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserCreatedEvent, UserDeletedEvent } from '../events';
import { Email } from '../models/email';
import { EmailSender } from '../ports/email.sender';
import { EventBroker } from '../ports/event.broker';
import { InfoRepository } from '../ports/info.repository';

export class NotificationService {
  public constructor(
    private readonly repo: InfoRepository,
    private readonly email_sender: EmailSender,
    private readonly broker: EventBroker
  ) {
    broker.on_user_created('user_created', this.create_user, this);
    broker.on_user_deleted('user_deleted', this.delete_user, this);
  }

  public async create_user(event: UserCreatedEvent): Promise<void> {
    try {
      const email = Email.from_string(event.email, true);
      const created = this.repo.create_user(event.user_id, email);

      if (!created) {
        throw new InternalServerError();
      }

      await this.email_sender.send_account_created(
        email,
        event.user_name,
        event.password
      );
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
}
