//
//
//

import { UserID } from '@nextapp/common/user';
import { Username } from '../models/credentials';
import { Email } from '../models/email';
import { SearchOptions } from '../models/search';
import { IdentityInfo, User } from '../models/user';

export interface UserInfoService {
  /**
   * Returns the information of the user with the passed id.
   * @param id the id of the user to get info
   */
  get_user(id: UserID): Promise<User>;

  /**
   * Return the list of all users.
   * This method can throw an error if the user is not authorized to do so.
   * @param requester the user who wants to get the list of all users
   * (only sys-admins can get the list of all users)
   */
  get_users(requester: UserID, options: SearchOptions): Promise<User[]>;

  /**
   * Creates a new user with the passed information.
   * This method can throw an error if the given information are not correct.
   * @param requester the user who wants to create a new user
   * (only sys-admins can create new users)
   */
  create_user(
    requester: UserID,
    username: string,
    password: string,
    is_admin: boolean,
    identity: IdentityInfo,
    email: Email
  ): Promise<UserID>;

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
   * Resets the password of the user and sends an email to them
   * with the new password.
   * @param username
   */
  forgot_password(username: Username): Promise<void>;

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
   * Get user's picture if it exists.
   * @param user
   */
  get_picture(user: UserID): Promise<{ buffer: Buffer; mimetype: string }>;

  /**
   * Adds a profile picture to the user.
   * @param user
   * @param path
   */
  add_picture(user: UserID, path: string, mimetype: string): Promise<void>;

  /**
   * Deletes the user picture if previously added.
   * @param user
   */
  delete_picture(user: UserID): Promise<void>;

  /**
   * Deletes the account associated to the user.
   * This method can be invoked only by the user or by an admin.
   * @param requester
   * @param user
   */
  delete_user(requester: UserID, user: UserID): Promise<void>;
}
