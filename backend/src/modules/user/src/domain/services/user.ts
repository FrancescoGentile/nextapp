//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import {
  InternalServerError,
  NotAnAdmin,
  UsernameAlreadyUsed,
  UserNotFound,
} from '../errors/errors.index';
import { User } from '../models/user';
import { UserInfoService } from '../ports/user.service';
import { UserRepository } from '../ports/user.repository';

export class NextUserInfoService implements UserInfoService {
  public constructor(private readonly user_repo: UserRepository) {}

  public async register_user(
    requester: UserID,
    new_user: User
  ): Promise<UserID> {
    if (!(await this.is_admin(requester))) {
      throw new NotAnAdmin();
    }

    const id = await this.user_repo.create_user(new_user);
    if (id === undefined) {
      throw new UsernameAlreadyUsed(new_user.username.to_string());
    }
    return id;
  }

  public async get_user_list(admin: UserID): Promise<User[]> {
    if (!(await this.is_admin(admin))) {
      throw new NotAnAdmin();
    }
    return this.user_repo.get_user_list();
  }

  public async get_user_info(requester: UserID, id: UserID): Promise<User> {
    if (!(await this.is_admin(requester)) && !requester.equals(id)) {
      throw new NotAnAdmin();
    }
    const user = await this.user_repo.get_user_info(id);
    if (user === null) {
      throw new UserNotFound(id.to_string());
    }

    return user;
  }

  public async ban_user(requester: UserID, id: UserID): Promise<void> {
    if (!(await this.is_admin(requester))) {
      throw new NotAnAdmin();
    }
    const deleted = await this.user_repo.delete_user(id);
    if (!deleted) {
      throw new UserNotFound(id.to_string());
    }
  }

  private async is_admin(user_id: UserID): Promise<boolean> {
    const role = await this.user_repo.get_user_role(user_id);
    if (role === null) {
      // the user with the given id has still not been created
      throw new InternalServerError();
    }
    return role === UserRole.SYS_ADMIN;
  }

  public async change_role(
    requester: UserID,
    admin_to_down: UserID,
    role: UserRole
  ): Promise<void> {
    if (!(await this.is_admin(requester))) {
      throw new NotAnAdmin();
    }
    this.user_repo.change_role(admin_to_down, role);
  }
}
