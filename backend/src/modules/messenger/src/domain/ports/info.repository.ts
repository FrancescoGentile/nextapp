//
//
//

import { UserID } from '@nextapp/common/user';
import { Email } from '../models/email';

export interface InfoRepository {
  /**
   * Adds a new user to the repositor only if their id
   * does not already exist.
   * @param user_id
   */
  create_user(user_id: UserID, email: Email): Promise<boolean>;
}
