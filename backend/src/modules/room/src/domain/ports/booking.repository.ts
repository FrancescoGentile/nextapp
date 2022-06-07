//
//
//

import { UserID } from '@nextapp/common/user';
import { Booking, BookingID, OrganiserID } from '../models/booking';
import { SearchOptions } from '../models/search';
import { RoomID } from '../models/room';
import { NextInterval } from '../models/interval';

export interface BookingRepository {
  /**
   * Returns the booking with the given id and made by the given user
   * if it exists.
   * @param user_id
   * @param booking_id
   */
  get_user_booking(
    user_id: UserID,
    booking_ids: BookingID
  ): Promise<Booking | null>;

  /**
   * Returns all the bookings for the given room and that
   * overlap the passed interval.
   * @param room_id
   * @param interval
   */
  get_bookings_by_room_interval(
    room_id: RoomID,
    interval: NextInterval
  ): Promise<Booking[]>;

  /**
   * Returns the ids of the bookings made by the given user
   * in the given interval of time.
   * @param user_id
   * @param options
   */
  search_user_bookings(
    user_id: UserID,
    interval: NextInterval,
    options: SearchOptions
  ): Promise<Booking[]>;

  /**
   * Adds the given booking to the repository.
   * This method returns undefined if the user or the room do not exist in the repo.
   * @param booking
   */
  create_booking(booking: Booking): Promise<BookingID | undefined>;

  /**
   * Deletes from the repository the booking with the given id and made by the given user.
   * This method returns false if no booking is found.
   * @param user_id
   * @param booking_id
   */
  delete_booking(user_id: UserID, booking_id: BookingID): Promise<boolean>;

  /**
   * Deletes from the repository the booking with the given id and made by the given organiser.
   * This method returns false if no booking is found.
   * @param organiser
   * @param booking_id
   */
  delete_organiser_booking(
    organiser: OrganiserID,
    booking_id: BookingID
  ): Promise<boolean>;
}
