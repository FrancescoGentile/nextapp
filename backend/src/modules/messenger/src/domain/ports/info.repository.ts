//
//
//

import { UserID } from '@nextapp/common/user';
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
}
