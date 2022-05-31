//
//
//

import { UserID } from '@nextapp/common/user';
import { WebDevice, WebDeviceID } from '../models/device';
import { Email, EmailID } from '../models/email';
import { SearchOptions } from '../models/search';

export interface UserInfoService {
  /**
   * Returns the info associated to the email with the passed id.
   * This method throws an EmailNotFound if no email was found.
   * @param user_id
   * @param email_id
   */
  get_email(user_id: UserID, email_id: EmailID): Promise<Email>;

  /**
   * Returns the emails added by the user.
   * @param user_id
   * @param options
   */
  get_emails(user_id: UserID, options: SearchOptions): Promise<Email[]>;

  /**
   * Adds the given emails to the user.
   * This method throws an error if the user already added the given email.
   * @param user_id
   * @param email
   */
  add_email(user_id: UserID, email: Email): Promise<EmailID>;

  /**
   * Deletes the given mail from the set of the user's emails.
   * This method throws an error if the user has no mail with the given id.
   * This method throws an error if the user is trying to delete their only email.
   * @param user_id
   * @param email_id
   */
  delete_email(user_id: UserID, email_id: EmailID): Promise<void>;

  // -----------------------------------------------------------------

  /**
   * Returns the device with the given id.
   * This method throws an error if no device was found.
   * @param user_id
   * @param device_id
   */
  get_device(user_id: UserID, device_id: WebDeviceID): Promise<WebDevice>;

  /**
   * returns the devices saved by the user.
   * @param user_id
   * @param options
   */
  get_devices(user_id: UserID, options: SearchOptions): Promise<WebDevice[]>;

  /**
   * Adds the passed device to the one already saved by the user.
   * @param user_id
   * @param device
   */
  add_device(user_id: UserID, device: WebDevice): Promise<WebDeviceID>;

  /**
   * Removes the device from the ones saved by the user.
   * This method throws an error if no device with the given id was found.
   * @param user_id
   * @param device_id
   */
  delete_device(user_id: UserID, device_id: WebDeviceID): Promise<void>;
}
