//
//
//

import { Room, RoomID } from '../models/room';
import { SearchOptions } from '../models/search';

export interface RoomRepository {
  /**
   * Returns the rooms with the given ids if they exist.
   * @param ids
   */
  get_rooms(ids: RoomID[]): Promise<Room[]>;

  /**
   * Returns ids of the rooms saved in the repository.
   * @param options
   */
  search_rooms(options: SearchOptions): Promise<RoomID[]>;

  /**
   * Returns the ids of the rooms in the given floor.
   * @param floor
   * @param options
   */
  search_rooms_by_floor(
    floor: number,
    options: SearchOptions
  ): Promise<RoomID[]>;

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
