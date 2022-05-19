//
//
//

import { EventBroker } from '../ports/event.broker';
import { RoomRepository } from '../ports/room.repository';
import { RoomInfoService } from '../ports/room.service';
import { UserRepository } from '../ports/user.repository';
import { NextRoomInfoService } from './room';
import { NextUserService } from './user';

export function init_services(
  user_repo: UserRepository,
  room_repo: RoomRepository,
  broker: EventBroker
): { room_service: RoomInfoService } {
  const room_service = new NextRoomInfoService(room_repo, user_repo);
  const _ = new NextUserService(broker, user_repo);

  return { room_service };
}
