//
//
//

import { UserID } from '@nextapp/common/user';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { InvalidAuthToken } from '../errors/errors.index';

export class AuthKey {
  public constructor(private readonly key: string) {}

  public to_string(): string {
    return this.key;
  }
}

export class AuthToken {
  public constructor(private readonly token: string) {}

  public static generate(user_id: UserID, key: AuthKey): AuthToken {
    const token = jwt.sign({ id: user_id.to_string() }, key.to_string(), {
      expiresIn: '24h',
    });

    return new AuthToken(token);
  }

  public verify(key: AuthKey): UserID {
    try {
      const payload = jwt.verify(this.token, key.to_string()) as JwtPayload;
      return new UserID(payload.id);
    } catch {
      throw new InvalidAuthToken();
    }
  }

  public to_string(): string {
    return this.token;
  }
}
