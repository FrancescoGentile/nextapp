//
//
//

import { UserID } from '@nextapp/common/user';
import { Duration } from 'luxon';
import { TOTP } from 'otpauth';
import { Username } from '../models/user.credentials';
import { MFAID } from '../models/mfa';
import { Session, SessionID } from '../models/session';
import { AuthService } from '../ports/auth.service';
import { UserRepository } from '../ports/user.repository';
import { SessionStore } from '../ports/session.store';

export class NextAuthService implements AuthService {
  public constructor(
    private readonly user_repo: UserRepository,
    private readonly session_store: SessionStore,
  ) {}

  public async login_with_credentials(username: string, password: string): Promise<SessionID> {
    const uname = Username.from_string(username);
    const info = await this.user_repo.get_security_info(uname);
    if (info === null) {
      // TODO: create specific error
      throw new Error('ciao');
    }
    const { id, security } = info;
    const valid_pwd = await security.credentials.password.verify(password);
    if (!valid_pwd) {
      // TODO: create specific error
      throw new Error('ciao');
    }

    if (!security.mfa.enabled) {
      const session: Session = { user: id, mfa: null, ttl: Duration.fromObject({ hours: 12 }) };
      const session_id = await this.session_store.save_session(session);
      return session_id;
    }

    const mfa = security.mfa.methods[0];
    if (mfa.method instanceof TOTP) {
      const session: Session = { user: id, mfa, ttl: Duration.fromObject({ minutes: 5 }) };
      const session_id = await this.session_store.save_session(session);
      return session_id;
    }

    // TODO: send message
    const session: Session = { user: id, mfa, ttl: Duration.fromObject({ minutes: 5 }) };
    const session_id = await this.session_store.save_session(session);
    return session_id;
  }

  public async login_with_mfa(session_id: SessionID, mfa_id: MFAID, token: string):
  Promise<SessionID> {
    const session = await this.session_store.get_session(session_id);
    if (session === null) {
      // TODO: create error
      throw new Error('you need to log with your credentials first');
    } else if (session.mfa === null) {
      // TODO: create error
      throw new Error('you are already logged in');
    }

    const { mfa } = session;
    if (!mfa.id.equals(mfa_id)) {
      // TODO: create error
      throw new Error('this is not your mfa method');
    }

    if (!mfa.method.validate(token)) {
      // TODO: create error
      throw new Error('Invalid token');
    }

    session.mfa = null;
    session.ttl = Duration.fromObject({ hours: 24 });
    const [, id] = await Promise.all([
      this.session_store.delete_session(session.id!),
      this.session_store.save_session(session),
    ]);

    return id;
  }

  public async verify_session(session_id: SessionID): Promise<UserID | null> {
    const session = await this.session_store.get_session(session_id);
    return session === null ? null : session.user;
  }

  public async logout(session_id: SessionID): Promise<void> {
    await this.session_store.delete_session(session_id);
  }

  public async logout_all(session_id: SessionID): Promise<void> {
    const session = await this.session_store.get_session(session_id);
    if (session === null) {
      // TODO: create
      throw new Error('');
    }
    await this.session_store.delete_user_session(session.user);
  }
}
