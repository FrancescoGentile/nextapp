//
//
//

import { UserID } from '@nextapp/common/user';
import { Booking, BookingID, BookingInterval } from '../models/booking';
import { SearchOptions } from '../models/options';
import { RoomID } from '../models/room';

export interface BookingRepository {
  /**
   * Returns the bookings with the given ids if they exist
   * and if they were made by the user with the given id.
   * @param user_id
   * @param booking_ids
   */
  get_user_bookings(
    user_id: UserID,
    booking_ids: BookingID[]
  ): Promise<Booking[]>;

  /**
   * Returns all the bookings for the given room and that
   * overlap the passed interval.
   * @param room_id
   * @param interval
   */
  get_bookings_by_room_interval(
    room_id: RoomID,
    interval: BookingInterval
  ): Promise<Booking[]>;

  /**
   * Returns the ids of the bookings made by the given user.
   * @param user_id
   * @param options
   */
  search_user_bookings(
    user_id: UserID,
    options: SearchOptions
  ): Promise<BookingID[]>;

  /**
   * Returns the ids of the bookings for the given user and
   * in the given time interval.
   * @param user_id
   * @param interval
   */
  search_bookings_by_user_interval(
    user_id: UserID,
    interval: BookingInterval
  ): Promise<BookingID[]>;

  /**
   * Adds the given booking to the repository.
   * This method returns undefined if the user or the room do not exist in the repo.
   * @param booking
   */
  create_booking(booking: Booking): Promise<BookingID | undefined>;

  /**
   * Deletes from the repository the booking with the given id and made by the given user.
   * This method returns false if no booking with the given conditions is found.
   * @param user_id
   * @param booking_id
   */
  delete_booking(user_id: UserID, booking_id: BookingID): Promise<boolean>;
}
