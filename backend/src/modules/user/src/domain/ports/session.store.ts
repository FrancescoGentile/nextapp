//
//
//

import { UserID } from '@nextapp/common/user';
import { Session, SessionID } from '../models/session';

export interface SessionStore {

  /**
   * Saves the session and returns the id associated to it.
   * @param session
   */
  save_session(session: Session): Promise<SessionID>

  /**
   * Deletes the session with the specified id if it exists.
   * @param session_id
   */
  delete_session(session_id: SessionID): Promise<boolean>

  /**
   * Deletes all sessions associated to the current user.
   * @param user_id
   */
  delete_user_session(user_id: UserID): Promise<boolean>

  /**
   * Returns the session with the specified id if it exists.
   * @param session_id
   */
  get_session(session_id: SessionID): Promise<Session | null>

  /**
   * Updates the session if it exists.
   * @param session
   */
  update_session(session: Session): Promise<boolean>
}