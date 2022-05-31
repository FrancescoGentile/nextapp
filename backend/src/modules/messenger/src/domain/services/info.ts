//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';
import {
  AlreadyUsedEmail,
  DeletingMainEmail,
  DeviceNotFound,
  EmailNotFound,
} from '../errors';
import { WebDevice, WebDeviceID } from '../models/device';
import { Email, EmailID } from '../models/email';
import { SearchOptions } from '../models/search';
import { InfoRepository } from '../ports/info.repository';
import { UserInfoService } from '../ports/info.service';

export class NextUserInfoService implements UserInfoService {
  public constructor(private readonly repo: InfoRepository) {}

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

  // ----------------------------------------------------------

  public async get_device(
    user_id: UserID,
    device_id: WebDeviceID
  ): Promise<WebDevice> {
    const device = await this.repo.get_device(user_id, device_id);
    if (device === null) {
      throw new DeviceNotFound(device_id.to_string());
    }

    return device;
  }

  public async get_devices(
    user_id: UserID,
    options: SearchOptions
  ): Promise<WebDevice[]> {
    return this.repo.get_devices(user_id, options);
  }

  public async add_device(
    user_id: UserID,
    device: WebDevice
  ): Promise<WebDeviceID> {
    const present = await this.repo.check_device_by_token(
      user_id,
      device.token
    );

    if (present) {
      // TODO: decide what to do
      throw new Error('');
    }

    const id = await this.repo.add_device(user_id, device);
    if (id === undefined) {
      throw new InternalServerError();
    }

    return id;
  }

  public async delete_device(
    user_id: UserID,
    device_id: WebDeviceID
  ): Promise<void> {
    const deleted = await this.repo.delete_device(user_id, device_id);
    if (!deleted) {
      throw new DeviceNotFound(device_id.to_string());
    }
  }
}
