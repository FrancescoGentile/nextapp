//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
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
  
  /**
    * Gets the user list.
    * @param user_id the user id who wants to get the list of all users
    */
   
  get_user_list(): Promise<User[]>;

  /**
   * Gets the user information with the given id.
   * @param user_id the id of the user to get
   */
  get_user_info(user_id: UserID): Promise<User>;


  /**
   * Returns the user role if they exist.
   * @param user_id
   */
  get_user_role(user_id: UserID): Promise<UserRole | null>;

  /**
   * Returns void.
   * @param admin_to_down admin to downgrade
   */
  change_role(admin_to_down: UserID, role: UserRole): Promise<void>;


  /**
   * Bans the user with the given id.
   * @param user_id the id of the user to ban
   * 
   */
   delete_user(user_id: UserID): Promise<boolean>;

}