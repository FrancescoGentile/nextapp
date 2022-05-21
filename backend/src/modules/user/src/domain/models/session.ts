//
//
//

import { UserID } from '@nextapp/common/user';
import { nanoid } from 'nanoid';
import { Duration } from 'luxon';
import { MFA } from './mfa';

export class SessionID {
  public constructor(private readonly id: string) {}

  public static generate(): SessionID {
    return new SessionID(nanoid());
  }

  public to_string(): string {
    return this.id;
  }
}

export interface Session {
  id?: SessionID,
  user: UserID,
  mfa: MFA | null,
  ttl: Duration
}
