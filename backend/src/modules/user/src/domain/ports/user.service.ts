//
//
//

import { UserID } from '@nextapp/common/user';
import { User } from '../models/user';

export interface UserInfoService {
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
   * Return the information of the user with the passed id.
   * This method can throw an error if the user is not authorized to do so.
   * @param requester the user who wants to get the information of the user
   * with the passed id
   * @param id the id of the user to get info
   * (only sys-admins can get the information of any user)
   */
  get_user_info(requester: UserID, id: UserID): Promise<User>


  /**
   * Bans the user with the passed id.
   * @param requester the user who wants to ban the user with the passed id
   * (only sys-admins can ban any user)
   * @param id the id of the user to ban
   */
  ban_user(requester: UserID, id: UserID): Promise<void>
  
}