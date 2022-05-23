//
//
//

import { UserID } from '@nextapp/common/user';
import { SearchOptions } from '../models/search';
import { User } from '../models/user';

export interface UserInfoService {
  /**
   * Creates a new user with the passed information.
   * This method can throw an error if the given information are not correct.
   * @param requester the user who wants to create a new user
   * (only sys-admins can create new users)
   */
  register_user(requester: UserID, user: User): Promise<UserID>;

  /**
   * Return the list of all users.
   * This method can throw an error if the user is not authorized to do so.
   * @param requester the user who wants to get the list of all users
   * (only sys-admins can get the list of all users)
   */
  get_users_list(requester: UserID, options: SearchOptions): Promise<User[]>;

  /**
   * Returns the information of the user with the passed id.
   * This method can throw an error if the user is not authorized to do so.
   * @param requester the user who wants to get the information of the user
   * with the passed id
   * @param id the id of the user to get info
   * (only sys-admins can get the information of any user)
   */
  get_user_info(requester: UserID, id: UserID): Promise<User>;

  /**
   * Change user's password to the requested password.
   * @param user_id the user id of the user who wants to change their password
   * @param old_password the current password
   * @param new_password the new password to hash and store
   */
  change_password(
    user_id: UserID,
    old_password: string,
    new_password: string
  ): Promise<void>;

  /**
   * Changes the role of the user.
   * This method can throw an error if the user is not authorized to do so.
   * @param requester the user who wants to downgrade the admin
   * (only sys-admins can get the list of all users)
   */
  change_role(
    requester: UserID,
    user: UserID,
    is_admin: boolean
  ): Promise<void>;

  /**
   * Bans the user with the passed id.
   * @param requester the user who wants to ban the user with the passed id
   * (only sys-admins can ban any user)
   * @param id the id of the user to ban
   */
  remove_user(requester: UserID, id: UserID): Promise<void>;

  /**
   * Deletes the account of the requester.
   * @param user_id user who wants to delete thier account
   */
  delete_account(user_id: UserID): Promise<void>;
}
