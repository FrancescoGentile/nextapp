//
//
//

import { UserID } from '@nextapp/common/user';
import { MFAID } from '../models/mfa';
import { SessionID } from '../models/session';

export interface AuthService {

  /**
   *
   * @param username
   * @param password
   */
  login_with_credentials(username: string, password: string): Promise<SessionID>

  /**
   *
   * @param session
   * @param mfa
   * @param token
   */
  login_with_mfa(session_id: SessionID, mfa: MFAID, token: string): Promise<SessionID>

  /**
   * Returns the UserID associated to the session if it is a valid session.
   * This method can throw an error.
   * @param session_id
   */
  verify_session(session_id: SessionID): Promise<UserID | null>

  /**
   * Terminates the user session.
   * @param session_id
   */
  logout(session_id: SessionID): Promise<void>

  /**
   * Terminates all sessions associated to the user.
   * @param session_id
   */
  logout_all(session_id: SessionID): Promise<void>
}
