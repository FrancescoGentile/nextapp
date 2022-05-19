//
//
//

import { Room, RoomID } from '../models/room';

export interface RoomRepository {
  /**
   * Returns the rooms with the given ids if they exist.
   * @param ids
   */
  get_rooms(ids: RoomID[]): Promise<Room[]>;

  /**
   * Adds a room to the repository and
   * returns the new unique id associated to the room.
   * This method returns undefined if a room with the same name
   * already exists in the repository.
   * @param room
   */
  create_room(room: Room): Promise<RoomID | undefined>;

  /**
   * Deletes the room with the given id if it exists.
   * This method shoudl also delete all the bookings for this room.
   * @param room_id
   */
  delete_room(room_id: RoomID): Promise<boolean>;
}
