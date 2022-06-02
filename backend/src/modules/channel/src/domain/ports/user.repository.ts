//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { ChannelID } from '../models/channel';
import { User } from '../models/user';


export interface UserRepository {


  
  is_channel_admin(id: UserID, channel_id: ChannelID): Promise<boolean>;
  /**
   * Returns the user role if they exist.
   * @param user_id
   */
  get_user_role(user_id: UserID): Promise<UserRole | null>;

  /**
   * Sets the new role for the user with the given id.
   * Note that this method does not create a new user if the passed
   * user does not exist, but it returns false in this case.
   * @param user_id
   * @param role
   */
  set_user_role(user_id: UserID, role: UserRole): Promise<boolean>;

  /**
   * Adds the user if they do not already exist.
   * @param user
   */
  create_user(user: User): Promise<boolean>;

  /**
   * Deletes the user with the given id if they exist.
   * The deleted user will no more be a president.
   * @param user_id
   */
  delete_user(user_id: UserID): Promise<boolean>;

}
