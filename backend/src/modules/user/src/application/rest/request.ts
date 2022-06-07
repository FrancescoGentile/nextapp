//
//
//

import { UserID } from '@nextapp/common/user';
import { AuthService } from '../../domain/ports/auth.service';
import { UserInfoService } from '../../domain/ports/user.service';

declare module 'express-serve-static-core' {
  export interface Request {
    version: string;
    user_id: UserID;
    user_service: UserInfoService;
    auth_service: AuthService;
  }
}
