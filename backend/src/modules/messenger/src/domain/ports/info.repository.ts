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
}
