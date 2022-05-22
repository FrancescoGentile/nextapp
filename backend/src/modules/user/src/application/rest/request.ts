//
//
//

import { UserID } from '@nextapp/common/user';
import {} from 'express-serve-static-core';
import { AuthService } from '../../domain/ports/auth.service';
import { UserInfoService } from '../../domain/ports/user.service';

declare module 'express-serve-static-core' {
  export interface Request {
    user_id: UserID;
    user_service?: UserInfoService;
    auth_service: AuthService;
  }
  export interface LoginRequest extends Request{
    username: string;
    password: string;
  }
}
