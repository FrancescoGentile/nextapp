//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';
import { AlreadyUsedEmail, DeletingMainEmail, EmailNotFound } from '../errors';
import { UserCreatedEvent } from '../events';
import { Email, EmailID } from '../models/email';
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

  // ------------------------------- EMAIL -------------------------------

  public async add_email(user_id: UserID, email: Email): Promise<EmailID> {
    const { added, id } = await this.repo.add_email(user_id, email);
    if (!added && id === undefined) {
      throw new InternalServerError();
    } else if (!added) {
      throw new AlreadyUsedEmail(email.to_string());
    }

    return id!;
  }

  public async delete_email(user_id: UserID, email_id: EmailID): Promise<void> {
    const email = await this.repo.get_email(user_id, email_id);
    if (email === null) {
      throw new EmailNotFound(email_id.to_string());
    }

    if (email.main) {
      throw new DeletingMainEmail();
    }

    const deleted = await this.repo.delete_email(user_id, email_id);
    if (!deleted) {
      throw new InternalServerError();
    }
  }
}
