//
//
//


import { EventBroker } from '../ports/event.broker';
import { UserInfoService } from '../ports/user.service';
import { UserRepository } from '../ports/user.repository';
import { NextUserInfoService } from './user';

export function init_services(
  user_repo: UserRepository,
  broker: EventBroker
): { 
    user_service: UserInfoService; 
} {
  const user_service = new NextUserInfoService(room_repo, user_repo);
  const booking_service = new NextBookingService(booking_repo, room_repo);
  const _ = new NextUserService(broker, user_repo);

  return { room_service, booking_service };
}