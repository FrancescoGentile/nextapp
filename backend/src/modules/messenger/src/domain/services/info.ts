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
  TokenAlreadyRegistered,
} from '../errors';
import { WebDevice, WebDeviceID } from '../models/device';
import { EmailAddress, EmailID } from '../models/email';
import { SearchOptions } from '../models/search';
import { InfoRepository } from '../ports/info.repository';
import { UserInfoService } from '../ports/info.service';

export class NextUserInfoService implements UserInfoService {
  public constructor(private readonly repo: InfoRepository) {}

  // ------------------------------- EMAIL -------------------------------

  public async get_email(
    user_id: UserID,
    email_id: EmailID
  ): Promise<EmailAddress> {
    const email = await this.repo.get_email(user_id, email_id);
    if (email === null) {
      throw new EmailNotFound(email_id.to_string());
    }

    return email;
  }

  public async get_emails(
    user_id: UserID,
    options: SearchOptions
  ): Promise<EmailAddress[]> {
    return this.repo.get_emails(user_id, options);
  }

  public async set_main_email(
    user_id: UserID,
    email_id: EmailID
  ): Promise<void> {
    const email = await this.repo.get_email(user_id, email_id);
    if (email === null) {
      throw new EmailNotFound(email_id.to_string());
    }

    if (email.main) {
      return;
    }

    const [unset, set] = await Promise.all([
      this.repo.unset_email_main(user_id),
      this.repo.set_email_main(user_id, email_id),
    ]);

    if (!set || !unset) {
      throw new InternalServerError();
    }
  }

  public async add_email(
    user_id: UserID,
    email: EmailAddress
  ): Promise<EmailID> {
    const already_used = await this.repo.check_email_by_name(user_id, email);
    if (already_used) {
      throw new AlreadyUsedEmail(email.to_string());
    }

    let id: EmailID;
    if (email.main) {
      [, id] = await Promise.all([
        this.repo.unset_email_main(user_id),
        this.repo.add_email(user_id, email),
      ]);
    } else {
      id = await this.repo.add_email(user_id, email);
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
    const present_id = await this.repo.check_device_by_token(
      user_id,
      device.token
    );

    if (present_id !== null) {
      throw new TokenAlreadyRegistered(
        device.token.to_string(),
        present_id.to_string()
      );
    }

    const id = await this.repo.add_device(user_id, device);
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
