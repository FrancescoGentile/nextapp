//
//
//

import { UserID } from '@nextapp/common/user';
import { Username } from '../models/user.credentials';
import { IdentityInfo } from '../models/user.info';
import { User } from '../models/user';

export interface UserInfoService {
    /**
   * Creates a new user with the passed information.
   * This method can throw an error if the given information are not correct.
   * @param requester the user who wants to create a new user
   * (only sys-admins can create new users)
   */
  register_user(requester: UserID, user: User): Promise<UserID>
}