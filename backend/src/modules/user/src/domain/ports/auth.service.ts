//
//
//

import { UserID } from '@nextapp/common/user';
import { AuthToken } from '../models/auth';

export interface AuthService {
  /** User login with SFA
   *
   * @param username
   * @param password
   */
  login_with_credentials(
    username: string,
    password: string
  ): Promise<AuthToken>;

  /** User authenticate with JWT
   *
   * @param token
   */
  authenticate(token: AuthToken): UserID;
}
