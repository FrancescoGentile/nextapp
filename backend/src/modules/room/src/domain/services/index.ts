//
//
//

import { BookingRepository } from '../ports/booking.repository';
import { BookingService } from '../ports/booking.service';
import { EventBroker } from '../ports/event.broker';
import { RoomRepository } from '../ports/room.repository';
import { RoomInfoService } from '../ports/room.service';
import { UserRepository } from '../ports/user.repository';
import { NextBookingService } from './booking';
import { NextRoomInfoService } from './room';
import { NextUserService } from './user';

export function init_services(
  user_repo: UserRepository,
  room_repo: RoomRepository,
  booking_repo: BookingRepository,
  broker: EventBroker
): { room_service: RoomInfoService; booking_service: BookingService } {
  const room_service = new NextRoomInfoService(
    room_repo,
    booking_repo,
    user_repo
  );
  const booking_service = new NextBookingService(booking_repo, room_repo);
  const _ = new NextUserService(broker, user_repo);

  return { room_service, booking_service };
}
