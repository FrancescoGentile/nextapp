//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { BookingRepository } from '../domain/ports/booking.repository';
import { EventBroker } from '../domain/ports/event.broker';
import { RoomRepository } from '../domain/ports/room.repository';
import { UserRepository } from '../domain/ports/user.repository';
import { EventEmitterBroker } from './broker/emitter';
import { Neo4jBookingRepository } from './repository/booking';
import { Neo4jRoomRepository } from './repository/room';
import { Neo4jUserRepository } from './repository/user';

export async function init_infrastructure(
  driver: Driver,
  emitter: EventEmitter
): Promise<{
  user_repo: UserRepository;
  room_repo: RoomRepository;
  booking_repo: BookingRepository;
  broker: EventBroker;
}> {
  const user_repo = await Neo4jUserRepository.create(driver);
  const room_repo = await Neo4jRoomRepository.create(driver);
  const booking_repo = await Neo4jBookingRepository.create(driver);
  const broker = new EventEmitterBroker(emitter);

  return { user_repo, room_repo, booking_repo, broker };
}
