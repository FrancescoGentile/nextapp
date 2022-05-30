//
//
//

import { UserID } from '@nextapp/common/user';
import { Email, EmailID } from '../models/email';

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
   * Adds the new email to the emails of the user.
   * If the given email is already associated to the user,
   * this method returns the id associated to the already existing email.
   * If no user with the given id exists, added is set to false and id is undefined.
   * @param user_id
   * @param email
   */
  add_email(
    user_id: UserID,
    email: Email
  ): Promise<{ added: boolean; id?: EmailID }>;

  /**
   * Deletes the given email from the ones the user has associated.
   * This method returns false if the given mail does not exist.
   * @param user_id
   * @param email_id
   */
  delete_email(user_id: UserID, email_id: EmailID): Promise<boolean>;
}
