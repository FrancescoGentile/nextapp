//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { Password, Username } from '../models/user.credentials';
import { User } from '../models/user';

export interface UserRepository {
  /**
   * Saves the given user into the repository and returns a unique id associated to it.
   * This method returns undefined if a user with the same username is already saved.
   * @param user
   */
  create_user(user: User): Promise<UserID | undefined>;

  /**
   * Returns if the user with the given id is a sys-admin.
   * Note that if the id does not exist, the method simply returns false.
   * @param user_id
   */
  check_system_administrator(user_id: UserID): Promise<boolean>;

  /**
   * Gets the user list.
   * @param user_id the user id who wants to get the list of all users
   */

  get_user_list(): Promise<User[]>;

  /**
   * Gets the user information with the given id.
   * @param user_id the id of the user to get
   */
  get_user_info(user_id: UserID): Promise<User | null>;

  /**
   * Returns the user role if they exist.
   * @param user_id
   */
  get_user_role(user_id: UserID): Promise<UserRole | null>;

  /**
   * Changes the user's role with the given one.
   * Returns false if no user with the given id was found.
   * @param user
   */
  change_role(user: UserID, role: UserRole): Promise<boolean>;

  /**
   * Changes the password of the given user if they exist.
   * @param user_id
   * @param password
   */
  change_password(user_id: UserID, password: Password): Promise<boolean>;

  /**
   * Return the id and password of the user with the given username if they exist.
   * This method may throw an error.
   * @param username
   */
  get_id_password(
    username: Username
  ): Promise<{ id: UserID; password: Password } | null>;

  /**
   * Bans the user with the given id.
   * @param user_id the id of the user to ban
   *
   */
  delete_user(user_id: UserID): Promise<boolean>;
}
