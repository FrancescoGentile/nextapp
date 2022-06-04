//
//
//

import { UserID } from '@nextapp/common/user';
import {} from 'express-serve-static-core';
import { UserInfoService } from '../../domain/ports/info.service';

declare module 'express-serve-static-core' {
  export interface Request {
    version: string;
    user_id: UserID;
    info_service: UserInfoService;
  }
}
