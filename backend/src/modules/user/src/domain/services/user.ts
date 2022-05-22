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
import { 
  Username,
  Password
} from '../models/user.credentials';
import { UserInfoService } from '../ports/user.service';
import { UserRepository } from '../ports/user.repository';
import { InvalidCredentials } from '../errors/errors.index';

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
  
  public async unsubscribe(requester_id: UserID){
    const deleted = await this.user_repo.delete_user(requester_id);
    if (!deleted) {
      throw new UserNotFound(requester_id.to_string());
    }
  }
  
  public async change_password(
    requester_username: string, 
    old_password: string, 
    new_password: string
  ): Promise<boolean> {
    const uname = Username.from_string(requester_username);
    const info = await this.user_repo.get_id_password(uname);
    const res = info!.password;
    const valid = await res!.verify(old_password);
    if (valid!) {
      const passed_psw = await Password.from_clear(new_password, uname);
      if(await this.user_repo.change_password(info!.id,passed_psw!)){
        return true;
      } else{
        return false;
      }
    } else {
      throw new InvalidCredentials();
    }
  }
}
