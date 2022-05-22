//
//
//

import { Room, RoomID } from '../models/room';
import { SearchOptions } from '../models/search';

export interface RoomRepository {
  /**
   * Returns the room with the given id if it exists.
   * @param ids
   */
  get_room(id: RoomID): Promise<Room | null>;

  /**
   * Returns a list of rooms given the options.
   * If floor is passed, only the rooms located in the given floor are returned.
   * @param floor
   * @param options
   */
  search_rooms(options: SearchOptions, floor?: number): Promise<Room[]>;

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
