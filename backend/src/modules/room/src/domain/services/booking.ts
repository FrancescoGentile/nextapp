//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import {
  BookingNotFound,
  InternalServerError,
  InvalidBookingRoom,
  OverlappingBooking,
  RoomNotAvailable,
} from '../errors';
import { BookingID, Booking, check_availability } from '../models/booking';
import { SearchOptions } from '../models/search';
import { RoomID } from '../models/room';
import { BookingRepository } from '../ports/booking.repository';
import { BookingService } from '../ports/booking.service';
import { RoomRepository } from '../ports/room.repository';
import { NextInterval } from '../models/interval';

export class NextBookingService implements BookingService {
  public constructor(
    private readonly booking_repo: BookingRepository,
    private readonly room_repo: RoomRepository
  ) {}

  public async get_booking(user_id: UserID, id: BookingID): Promise<Booking> {
    const booking = await this.booking_repo.get_user_booking(user_id, id);
    if (booking === null) {
      throw new BookingNotFound(id.to_string());
    }

    return booking;
  }

  public async search_bookings(
    user_id: UserID,
    start: DateTime,
    end: DateTime,
    options: SearchOptions
  ): Promise<Booking[]> {
    const interval = NextInterval.from_dates(start, end, false);
    return this.booking_repo.search_user_bookings(user_id, interval, options);
  }

  public async create_booking(
    user_id: UserID,
    room_id: RoomID,
    start: DateTime,
    end: DateTime
  ): Promise<BookingID> {
    const interval = NextInterval.from_dates(start, end, true);
    const [room, bookings] = await Promise.all([
      this.room_repo.get_room(room_id),
      this.booking_repo.get_bookings_by_room_interval(room_id, interval),
    ]);

    if (room === null) {
      throw new InvalidBookingRoom();
    }
    const booking: Booking = { user: user_id, room: room_id, interval };
    const available = check_availability(room, bookings, booking.interval);
    if (!available) {
      throw new RoomNotAvailable(room_id.to_string(), interval.interval);
    }

    const user_bookings = await this.booking_repo.search_user_bookings(
      user_id,
      interval,
      SearchOptions.build(0, 1)
    );
    if (user_bookings.length !== 0) {
      throw new OverlappingBooking(user_bookings[0].id!.to_string());
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
