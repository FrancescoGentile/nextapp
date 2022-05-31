//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';
import { AlreadyUsedEmail, DeletingMainEmail, EmailNotFound } from '../errors';
import { UserCreatedEvent, UserDeletedEvent } from '../events';
import { Email, EmailID } from '../models/email';
import { SearchOptions } from '../models/search';
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

  // ------------------------------- EMAIL -------------------------------

  public async get_email(user_id: UserID, email_id: EmailID): Promise<Email> {
    const email = await this.repo.get_email(user_id, email_id);
    if (email === null) {
      throw new EmailNotFound(email_id.to_string());
    }

    return email;
  }

  public async get_emails(
    user_id: UserID,
    options: SearchOptions
  ): Promise<Email[]> {
    return this.repo.get_emails(user_id, options);
  }

  public async add_email(user_id: UserID, email: Email): Promise<EmailID> {
    const already_used = await this.repo.check_email_by_name(user_id, email);
    if (already_used) {
      throw new AlreadyUsedEmail(email.to_string());
    }

    let id: EmailID | undefined;
    if (email.main) {
      await this.repo.change_email_main(user_id);
      id = await this.repo.add_email(user_id, email);
    } else {
      id = await this.add_email(user_id, email);
    }

    if (id === undefined) {
      throw new InternalServerError();
    }

    return id;
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
