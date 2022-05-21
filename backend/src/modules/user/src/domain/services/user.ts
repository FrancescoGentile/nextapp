//
//
//

import { UserID } from '@nextapp/common/user';
import {
    NotAnAdmin,
    UsernameAlreadyUsed
  } from '../errors/errors.index';
import { User } from '../models/user';
import { UserInfoService } from '../ports/user.service';
import { UserRepository } from '../ports/user.repository';

export class NextUserInfoService implements UserInfoService {
    public constructor(private readonly user_repo: UserRepository) {}

    public async register_user(requester: UserID, requestedUser: User): Promise<UserID> {
        const is_admin = await this.user_repo.check_system_administrator(requester);
        if (!is_admin) {
          throw new NotAnAdmin();
        }

        const unique_username = await this.user_repo.check_username(requestedUser.username);
        if (!unique_username) {
        throw new UsernameAlreadyUsed(requestedUser.username.to_string());
        }

        const id = await this.user_repo.create_user(requestedUser);
        return id;
    }
}