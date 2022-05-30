//
//
//

import { UserID } from '@nextapp/common/user';
import { Email, EmailID } from '../models/email';

export interface UserInfoService {
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
}
