//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { Booking, BookingID } from '../models/booking';
import { SearchOptions } from '../models/search';
import { RoomID } from '../models/room';

export interface BookingService {
  /**
   * Returns the booking with the given id made by the user with the
   * given id.
   * @param user_id
   * @param id
   */
  get_booking(user_id: UserID, id: BookingID): Promise<Booking>;

  /**
   * Returns the bookings made by the user in the given interval.
   * @param user_id
   * @param start
   * @param end
   * @param options
   */
  search_bookings(
    user_id: UserID,
    start: DateTime,
    end: DateTime,
    options: SearchOptions
  ): Promise<Booking[]>;

  /**
   * Creates a new booking for the given user and room in the specified time interval.
   * This method throw an error if the given information are not correct.
   * @param user_id
   * @param room_id
   * @param start
   * @param end
   */
  create_booking(
    user_id: UserID,
    room_id: RoomID,
    start: DateTime,
    end: DateTime
  ): Promise<BookingID>;

  /**
   * Removes the booking with the given id only if it was made by the passed user.
   * @param user_id
   * @param booking_id
   */
  delete_booking(user_id: UserID, booking_id: BookingID): Promise<void>;
}
