//
//
//

import { UserID } from '@nextapp/common/user';
import { AuthToken } from '../models/auth';
import { MFAID } from '../models/mfa';
import { SessionID } from '../models/session';

export interface AuthService {

  /**
   *
   * @param username
   * @param password
   */
  login_with_credentials(username: string, password: string): Promise<AuthToken>


  authenticate(token: AuthToken): UserID;
}
