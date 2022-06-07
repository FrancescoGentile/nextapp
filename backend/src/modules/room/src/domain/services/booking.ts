//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { ModuleID } from '@nextapp/common/event';
import { NextError } from '@nextapp/common/error';
import {
  BookingNotFound,
  InternalServerError,
  InvalidBookingRoom,
  OverlappingBooking,
  RoomNotAvailable,
} from '../errors';
import {
  BookingID,
  Booking,
  check_availability,
  OrganiserID,
} from '../models/booking';
import { SearchOptions } from '../models/search';
import { RoomID } from '../models/room';
import { BookingRepository } from '../ports/booking.repository';
import { BookingService } from '../ports/booking.service';
import { RoomRepository } from '../ports/room.repository';
import { NextInterval } from '../models/interval';
import { EventBroker } from '../ports/event.broker';
import {
  CreateBookingRequestEvent,
  DeleteBookingRequestEvent,
} from '../events';

export class NextBookingService implements BookingService {
  public constructor(
    private readonly booking_repo: BookingRepository,
    private readonly room_repo: RoomRepository,
    private readonly broker: EventBroker
  ) {
    broker.on_create_booking_request(
      'create_booking_request',
      this.create_organiser_booking,
      this
    );
    broker.on_delete_booking_request(
      'delete_booking_request',
      this.delete_organiser_booking,
      this
    );
  }

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
    const booking: Booking = {
      customer: user_id,
      room: room_id,
      seats: 1,
      interval,
    };
    const available = check_availability(
      room,
      bookings,
      booking.interval,
      booking.seats
    );
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

  private async create_organiser_booking(event: CreateBookingRequestEvent) {
    try {
      const interval = NextInterval.from_dates(event.start, event.end, true);
      const room_id = RoomID.from_string(event.room_id);
      const [room, bookings] = await Promise.all([
        this.room_repo.get_room(room_id),
        this.booking_repo.get_bookings_by_room_interval(room_id, interval),
      ]);

      if (room === null) {
        throw new InvalidBookingRoom();
      }

      const booking: Booking = {
        customer: new OrganiserID(event.requester_id),
        room: room_id,
        seats: 1,
        interval,
      };

      const available = check_availability(
        room,
        bookings,
        booking.interval,
        booking.seats
      );
      if (!available) {
        throw new RoomNotAvailable(room_id.to_string(), interval.interval);
      }

      const id = await this.booking_repo.create_booking(booking);
      if (id === undefined) {
        throw new InternalServerError();
      }

      this.broker.emit_create_booking_response({
        name: 'create_booking_response',
        module: ModuleID.ROOM,
        timestamp: DateTime.utc(),
        request_id: event.request_id,
        confirmed: true,
        booking_id: id.to_string(),
        seats: room.seats,
      });
    } catch (e) {
      const error = e as NextError;
      this.broker.emit_create_booking_response({
        name: 'create_booking_response',
        module: ModuleID.ROOM,
        timestamp: DateTime.utc(),
        request_id: event.request_id,
        confirmed: false,
        error: error.details,
      });
    }
  }

  private async delete_organiser_booking(event: DeleteBookingRequestEvent) {
    try {
      const booking_id = BookingID.from_string(event.booking_id);
      const deleted = await this.booking_repo.delete_organiser_booking(
        new OrganiserID(event.requester_id),
        booking_id
      );
      if (!deleted) {
        throw new BookingNotFound(booking_id.to_string());
      }

      this.broker.emit_delete_booking_response({
        name: 'delete_booking_request',
        module: ModuleID.ROOM,
        timestamp: DateTime.utc(),
        request_id: event.request_id,
        confirmed: true,
      });
    } catch (e) {
      const error = e as NextError;
      this.broker.emit_delete_booking_response({
        name: 'delete_booking_request',
        module: ModuleID.ROOM,
        timestamp: DateTime.utc(),
        request_id: event.request_id,
        confirmed: false,
        error: error.details,
      });
    }
  }
}
