//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserCreatedEvent } from '../events';
import { Email } from '../models/email';
import { EmailSender } from '../ports/email.sender';
import { EventBroker } from '../ports/event.broker';
import { InfoRepository } from '../ports/info.repository';
import { UserInfoService } from '../ports/info.service';

export class NextUserInfoService implements UserInfoService {
  public constructor(
    private readonly repo: InfoRepository,
    private readonly email_sender: EmailSender,
    private readonly broker: EventBroker
  ) {
    broker.on_user_created(this.create_user, this);
  }

  private async create_user(event: UserCreatedEvent): Promise<void> {
    try {
      const email = Email.from_string(event.email);
      const created = this.repo.create_user(event.user_id, event.email);

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
}
