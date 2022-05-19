//
//
//

import { UserID } from '@nextapp/common/user';
import { Room, RoomID } from '../models/room';

export interface RoomInfoService {
  /**
   * Returns the rooms with the given ids if they exist.
   * @param ids
   */
  get_rooms(ids: RoomID[]): Promise<Room[]>;

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
