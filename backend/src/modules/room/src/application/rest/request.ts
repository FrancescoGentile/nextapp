//
//
//

import { UserID } from '@nextapp/common/user';
import {} from 'express-serve-static-core';
import { BookingService } from '../../domain/ports/booking.service';
import { RoomInfoService } from '../../domain/ports/room.service';

declare module 'express-serve-static-core' {
  export interface Request {
    version: string;
    user_id: UserID;
    room_service: RoomInfoService;
    booking_service: BookingService;
  }
}
