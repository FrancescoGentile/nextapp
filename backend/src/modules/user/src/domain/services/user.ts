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
    
}