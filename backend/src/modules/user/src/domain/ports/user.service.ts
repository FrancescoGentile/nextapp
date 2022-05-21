//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { User } from '../models/user';

export interface UserInfoService {
  [x: string]: any;
    /**
   * Creates a new user with the passed information.
   * This method can throw an error if the given information are not correct.
   * @param requester the user who wants to create a new user
   * (only sys-admins can create new users)
   */
  register_user(requester: UserID, user: User): Promise<UserID>

  /**
   * Return the list of all users.
   * This method can throw an error if the user is not authorized to do so.
   * @param requester the user who wants to get the list of all users
   * (only sys-admins can get the list of all users)
   */
  get_user_list(requester: UserID): Promise<User[]>

  /**
   * Change user role to simple user or to admin.
   * This method can throw an error if the user is not authorized to do so.
   * @param requester the user who wants to downgrade the admin
   * (only sys-admins can get the list of all users)
   */
  change_role(requester: UserID, admin_to_down: UserID, role: UserRole): Promise<void>;

}