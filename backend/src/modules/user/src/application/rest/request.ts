//
//
//

import { UserID } from '@nextapp/common/user';
import {} from 'express-serve-static-core';
import { NextUserInfoService } from '../../domain/services/user';

declare module 'express-serve-static-core' {
  export interface Request {
    user_id: UserID;
    user_service?: NextUserInfoService;
  }
}