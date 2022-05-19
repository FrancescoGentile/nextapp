//
//
//

import { UserID } from '@nextapp/common/user';
import {} from 'express-serve-static-core';
import { RoomInfoService } from '../../domain/ports/room.service';

declare module 'express-serve-static-core' {
  export interface Request {
    user_id?: UserID;
    room_service?: RoomInfoService;
  }
}
