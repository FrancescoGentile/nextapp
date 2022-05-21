//
//
//

import { UserID } from '@nextapp/common/user';
import { Credentials, Password, Username } from '../models/user.credentials';
import { User } from '../models/user';

export interface UserRepository {

  /**
   * Saves the given user into the repository
   * and returns a unique id associated to it.
   * @param user
   */
  create_user(user: User): Promise<UserID>

  /**
   * Returns if a user with the given username exists.
   * @param username
   */
  check_username(username: Username): Promise<boolean>

  /**
   * Returns if the user with the given id is a sys-admin.
   * Note that if the id does not exist, the method simply returns false.
   * @param user_id
   */
  check_system_administrator(user_id: UserID): Promise<boolean>
}