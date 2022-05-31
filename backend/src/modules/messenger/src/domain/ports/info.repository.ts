//
//
//

import { UserID } from '@nextapp/common/user';
import { WebDevice, WebDeviceID } from '../models/device';
import { NotificationToken } from '../models/notification';
import { Email, EmailID } from '../models/email';
import { SearchOptions } from '../models/search';

export interface InfoRepository {
  /**
   * Adds a new user to the repositor only if their id
   * does not already exist.
   * @param user_id
   */
  create_user(user_id: UserID, email: Email): Promise<boolean>;

  /**
   * Removes the user and all their associated information from the repository.
   * This method returns false if no user with the given id was found.
   * @param user_id
   */
  delete_user(user_id: UserID): Promise<boolean>;

  // -----------------------------------------------------------

  /**
   * Returns the email of the user if it exists.
   * @param user_id
   * @param email_id
   */
  get_email(user_id: UserID, email_id: EmailID): Promise<Email | null>;

  /**
   * Returns the emails associated to the user with the given id.
   * @param user_id
   * @param options
   */
  get_emails(user_id: UserID, options: SearchOptions): Promise<Email[]>;

  /**
   * Checks if the user already has this email.
   * @param user_id
   * @param email
   */
  check_email_by_name(user_id: UserID, email: Email): Promise<boolean>;

  /**
   * Sets the current main mail as not main.
   * @param user_id
   * @param email_id
   * @param main
   */
  change_email_main(user_id: UserID): Promise<void>;

  /**
   * Adds the new email to the emails of the user.
   * If no user with the given id exists, undefined is returned.
   * @param user_id
   * @param email
   */
  add_email(user_id: UserID, email: Email): Promise<EmailID | undefined>;

  /**
   * Deletes the given email from the ones the user has associated.
   * This method returns false if the given mail does not exist.
   * @param user_id
   * @param email_id
   */
  delete_email(user_id: UserID, email_id: EmailID): Promise<boolean>;

  // -----------------------------------------------------------

  /**
   * Returns the device with the given id if it exists.
   * @param user_id
   * @param device_id
   */
  get_device(
    user_id: UserID,
    device_id: WebDeviceID
  ): Promise<WebDevice | null>;

  /**
   * returns the devices saved by the user.
   * @param user_id
   * @param options
   */
  get_devices(user_id: UserID, options: SearchOptions): Promise<WebDevice[]>;

  /**
   * Returns the notification tokens associated to the passed users.
   * @param user_ids
   */
  get_notification_tokens(user_ids: UserID[]): Promise<NotificationToken[]>;

  /**
   * Checks if the given user has a device associated to the given token.
   * @param user_id
   * @param token
   */
  check_device_by_token(
    user_id: UserID,
    token: NotificationToken
  ): Promise<boolean>;

  /**
   * Adds the passed device to the user.
   * This method returns undefined if no user with the given id was found.
   * @param user_id
   * @param device
   */
  add_device(
    user_id: UserID,
    device: WebDevice
  ): Promise<WebDeviceID | undefined>;

  /**
   * Removes the device with the given id from the ones saved by the user.
   * @param user_id
   * @param device_id
   */
  delete_device(user_id: UserID, device_id: WebDeviceID): Promise<boolean>;
}
