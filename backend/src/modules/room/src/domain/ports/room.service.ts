//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { SearchOptions } from '../models/search';
import { Room, RoomID } from '../models/room';
import { NextInterval } from '../models/interval';

export interface RoomInfoService {
  /**
   * Returns a list of valid floors where you can search a room.
   */
  get_floors(): Promise<number[]>;

  /**
   * Returns the slots in which the room can be booked.
   * @param room_id
   * @param start
   * @param end
   */
  get_available_slots(
    room_id: RoomID,
    start: DateTime,
    end: DateTime
  ): Promise<{ interval: NextInterval; seats: number }[]>;

  /**
   * Returns the room with the given id if it exists.
   * @param id
   */
  get_room(id: RoomID): Promise<Room>;

  /**
   * Returns the rooms which satisfy the given options.
   * @param options
   */
  search_rooms(
    options: SearchOptions,
    floor?: number,
    interval?: { start: DateTime; end: DateTime }
  ): Promise<Room[]>;

  /**
   * Creates a new room with the given information.
   * This method can be executed only by an admin.
   * This method throw and error if the room name is already used.
   * @param admin
   * @param room
   */
  create_room(admin: UserID, room: Room): Promise<RoomID>;

  /**
   * Removes the room with the given id if it exists.
   * This method can be executed only by an admin.
   * This method throw an error if no room with the given id exists.
   * @param admin
   * @param room_id
   */
  delete_room(admin: UserID, room_id: RoomID): Promise<void>;
}
