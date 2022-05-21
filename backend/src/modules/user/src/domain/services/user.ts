//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { User } from '../models/user';
import { UserInfoService } from '../ports/user.service';

export class NextUserInfoService implements UserInfoService {

    register_user(requester: UserID, user: User): Promise<UserID> {
        throw new Error('Method not implemented.');
    }

    get_user_list(requester: UserID): Promise<User[]> {
        if (!(await this.is_admin(admin))) {
            throw new NotAnAdmin();
          }
        return this.user_repo.get_user_list();
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