//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { ModuleID } from '@nextapp/common/event';
import { DateTime } from 'luxon';
import {
  InternalServerError,
  NotAnAdmin,
  UsernameAlreadyUsed,
  UserNotFound,
  OldPasswordWrong,
} from '../errors';
import { IdentityInfo, User } from '../models/user';
import { Password, Username } from '../models/credentials';
import { UserInfoService } from '../ports/user.service';
import { UserRepository } from '../ports/user.repository';
import { EventBroker } from '../ports/event.broker';
import { SearchOptions } from '../models/search';
import { Email } from '../models/email';

export class NextUserInfoService implements UserInfoService {
  public constructor(
    private readonly user_repo: UserRepository,
    private readonly broker: EventBroker
  ) {}

  public async get_user(requester: UserID, id: UserID): Promise<User> {
    if (!(await this.is_admin(requester)) && !requester.equals(id)) {
      throw new NotAnAdmin();
    }
    const user = await this.user_repo.get_user(id);
    if (user === null) {
      throw new UserNotFound(id.to_string());
    }

    return user;
  }

  public async get_users(
    admin: UserID,
    options: SearchOptions
  ): Promise<User[]> {
    if (!(await this.is_admin(admin))) {
      throw new NotAnAdmin();
    }

    return this.user_repo.get_users(options);
  }

  public async create_user(
    requester: UserID,
    uname: string,
    pwd: string,
    is_admin: boolean,
    identity: IdentityInfo,
    email: Email
  ): Promise<UserID> {
    if (!(await this.is_admin(requester))) {
      throw new NotAnAdmin();
    }

    const username = Username.from_string(uname);
    const password = await Password.from_clear(pwd, username);
    const credentials = { username, password };
    const role = is_admin ? UserRole.SYS_ADMIN : UserRole.SIMPLE;
    const user: User = { credentials, role, identity };

    const id = await this.user_repo.create_user(user);

    if (id === undefined) {
      throw new UsernameAlreadyUsed(uname);
    }

    this.broker.emit_user_created({
      name: 'user_created',
      module: ModuleID.USER,
      timestamp: DateTime.utc(),
      user_id: id,
      role,
      fullname: identity.fullname,
      username: uname,
      password: pwd,
      email: email.to_string(),
    });

    return id;
  }

  public async change_role(
    requester: UserID,
    user: UserID,
    is_admin: boolean
  ): Promise<void> {
    if (!(await this.is_admin(requester))) {
      throw new NotAnAdmin();
    }

    const role = is_admin ? UserRole.SYS_ADMIN : UserRole.SIMPLE;
    this.user_repo.change_role(user, role);

    this.broker.emit_user_role_changed({
      name: 'user_role_changed',
      module: ModuleID.USER,
      timestamp: DateTime.utc(),
      user_id: user,
      role,
    });
  }

  public async delete_user(requester: UserID, user: UserID): Promise<void> {
    if (!(await this.is_admin(requester)) && !requester.equals(user)) {
      throw new NotAnAdmin();
    }

    const deleted = await this.user_repo.delete_user(user);
    if (!deleted) {
      throw new UserNotFound(user.to_string());
    }

    this.broker.emit_user_deleted({
      name: 'user_deleted',
      module: ModuleID.USER,
      timestamp: DateTime.utc(),
      user_id: user,
    });
  }

  public async change_password(
    user_id: UserID,
    old_password: string,
    new_password: string
  ): Promise<void> {
    const user = await this.user_repo.get_user(user_id);
    if (user === null) {
      throw new InternalServerError();
    }

    const valid = await user.credentials.password.verify(old_password);
    if (!valid) {
      throw new OldPasswordWrong();
    }

    const new_pwd = await Password.from_clear(
      new_password,
      user.credentials.username
    );
    const changed = this.user_repo.change_password(user_id, new_pwd);
    if (!changed) {
      throw new InternalServerError();
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
}
