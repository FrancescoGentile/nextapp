//
//
//

import { UserID } from '@nextapp/common/user';
import { Username } from '../models/credentials';
import { AuthService } from '../ports/auth.service';
import { UserRepository } from '../ports/user.repository';
import { InternalServerError, InvalidCredentials } from '../errors';
import { AuthToken, AuthKey } from '../models/auth';

export class NextAuthService implements AuthService {
  public constructor(
    private readonly repo: UserRepository,
    private readonly key: AuthKey
  ) {}

  public async login_with_credentials(
    uname: string,
    pwd: string
  ): Promise<AuthToken> {
    let username: Username;
    try {
      username = Username.from_string(uname);
    } catch {
      throw new InvalidCredentials();
    }

    const res = await this.repo.get_id_password(username);
    if (res === null) {
      throw new InvalidCredentials();
    }

    const { id, password } = res;

    let valid: boolean;
    try {
      valid = await password.verify(pwd);
    } catch {
      throw new InternalServerError();
    }
    if (!valid) {
      throw new InvalidCredentials();
    }

    const token = AuthToken.generate(id, this.key);
    return token;
  }

  public authenticate(token: AuthToken): UserID {
    return token.verify(this.key);
  }
}
