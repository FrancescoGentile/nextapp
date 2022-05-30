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
}
