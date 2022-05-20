//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import {
  BookingNotFound,
  InternalServerError,
  OverlappingBooking,
  RoomNotAvailable,
  RoomNotFound,
} from '../errors';
import {
  BookingID,
  Booking,
  BookingInterval,
  check_availability,
} from '../models/booking';
import { SearchOptions } from '../models/options';
import { RoomID } from '../models/room';
import { BookingRepository } from '../ports/booking.repository';
import { BookingService } from '../ports/booking.service';
import { RoomRepository } from '../ports/room.repository';

export class NextBookingService implements BookingService {
  public constructor(
    private readonly booking_repo: BookingRepository,
    private readonly room_repo: RoomRepository
  ) {}

  public async get_bookings(
    user_id: UserID,
    ids: BookingID[]
  ): Promise<Booking[]> {
    return this.booking_repo.get_user_bookings(user_id, ids);
  }

  public async search_bookings(
    user_id: UserID,
    options: SearchOptions
  ): Promise<BookingID[]> {
    return this.booking_repo.search_user_bookings(user_id, options);
  }

  public async create_booking(
    user_id: UserID,
    room_id: RoomID,
    start: DateTime,
    end: DateTime
  ): Promise<BookingID> {
    const interval = BookingInterval.from_dates(start, end, true);
    const [rooms, bookings] = await Promise.all([
      this.room_repo.get_rooms([room_id]),
      this.booking_repo.get_bookings_by_room_interval(room_id, interval),
    ]);

    if (rooms.length === 0) {
      throw new RoomNotFound(room_id.to_string());
    }
    const room = rooms[0];
    const booking: Booking = { user: user_id, room: room_id, interval };
    const available = check_availability(room, bookings, booking);
    if (!available) {
      throw new RoomNotAvailable(room_id.to_string(), interval.interval);
    }

    const user_bookings =
      await this.booking_repo.search_bookings_by_user_interval(
        user_id,
        interval
      );
    if (user_bookings.length !== 0) {
      throw new OverlappingBooking();
    }

    const id = await this.booking_repo.create_booking(booking);
    if (id === undefined) {
      throw new InternalServerError();
    }

    return id;
  }

  public async delete_booking(
    user_id: UserID,
    booking_id: BookingID
  ): Promise<void> {
    const deleted = await this.booking_repo.delete_booking(user_id, booking_id);
    if (!deleted) {
      throw new BookingNotFound(booking_id.to_string());
    }
  }
}
