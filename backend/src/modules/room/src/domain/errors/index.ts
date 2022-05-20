//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';
import { Interval } from 'luxon';

export { InternalServerError } from '@nextapp/common/error';

// ---------------------------------------------------------------
// --------------------------- ROOM ------------------------------
// ---------------------------------------------------------------

enum RoomErrorTypes {
  INVALID_ID = 1,
  INVALID_NAME,
  INVALID_SEAT_NUMBER,
  INVALID_FLOOR,
  NAME_ALREADY_USED,
  ROOM_NOT_FOUND,
  ROOM_CREATION_NOT_AUTHORIZED,
  ROOM_DELETION_NOT_AUTHORIZED,
}

function get_room_type(type: RoomErrorTypes): string {
  return `room-${String(type).padStart(3, '0')}`;
}

export class InvalidRoomID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_room_type(RoomErrorTypes.INVALID_ID),
      StatusCodes.BAD_REQUEST,
      'Invalid room id',
      `${id} is not a valid id for a room`,
      options
    );
  }
}

export class InvalidRoomName extends NextError {
  public constructor(name: string, options?: ErrorOptions) {
    super(
      get_room_type(RoomErrorTypes.INVALID_NAME),
      StatusCodes.BAD_REQUEST,
      'Invalid room name',
      `${name} does not meet on or both of the following conditions:\
      length between 5 and 100 characters,\
      only lowercase and uppercase Latin letters, Arabic numerals, underscores and dashes.`,
      options
    );
  }
}

export class InvalidSeatNumber extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_room_type(RoomErrorTypes.INVALID_SEAT_NUMBER),
      StatusCodes.BAD_REQUEST,
      'Invalid number of seats',
      'The number of seats must be integer and greater than 0.',
      options
    );
  }
}

export class InvalidFloor extends NextError {
  public constructor(
    min_floor: number,
    max_floor: number,
    options?: ErrorOptions
  ) {
    super(
      get_room_type(RoomErrorTypes.INVALID_FLOOR),
      StatusCodes.BAD_REQUEST,
      'Invalid floor',
      `Floor must be integer, greater than or equal to ${min_floor} and less than or equal to ${max_floor}`,
      options
    );
  }
}

export class RoomNameAlreadyUsed extends NextError {
  public constructor(name: string, options?: ErrorOptions) {
    super(
      get_room_type(RoomErrorTypes.NAME_ALREADY_USED),
      StatusCodes.CONFLICT,
      'Name already used',
      `${name} is already assigned to anther room. Try another name.`,
      options
    );
  }
}

export class RoomNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_room_type(RoomErrorTypes.ROOM_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Room not found',
      `Room with id ${id} was not found.`,
      options
    );
  }
}

export class RoomCreationNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_room_type(RoomErrorTypes.ROOM_CREATION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to create a room',
      'You have to be a system adiministator to create a room.',
      options
    );
  }
}

export class RoomDeletionNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_room_type(RoomErrorTypes.ROOM_DELETION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to delete a room',
      'You have to be a system adiministator to delete a room.',
      options
    );
  }
}

// ---------------------------------------------------------------
// --------------------------- BOOKING ---------------------------
// ---------------------------------------------------------------

enum BookingErrorTypes {
  INVALID_BOOKING_ID = 1,
  INVALID_BOOKING_INTERVAL,
  BOOKING_NOT_FOUND,
  ROOM_NOT_AVAILABLE,
  OVERLAPPING_BOOKING,
}

function get_booking_type(type: BookingErrorTypes): string {
  return `booking-${String(type).padStart(3, '0')}`;
}

export class InvalidBookingID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_booking_type(BookingErrorTypes.INVALID_BOOKING_ID),
      StatusCodes.BAD_REQUEST,
      'Invalid booking id',
      `${id} is not a valid booking id.`,
      options
    );
  }
}

export class InvalidBookingInterval extends NextError {
  public constructor(details: any, options?: ErrorOptions) {
    super(
      get_booking_type(BookingErrorTypes.INVALID_BOOKING_INTERVAL),
      StatusCodes.BAD_REQUEST,
      'Invalid booking interval',
      details,
      options
    );
  }
}

export class BookingNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_booking_type(BookingErrorTypes.BOOKING_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Booking not found',
      `You have no booking with id ${id}.`,
      options
    );
  }
}

export class RoomNotAvailable extends NextError {
  public constructor(id: string, interval: Interval, options?: ErrorOptions) {
    super(
      get_booking_type(BookingErrorTypes.ROOM_NOT_AVAILABLE),
      StatusCodes.CONFLICT,
      'Room not available',
      `Room with id ${id} is already completely occupied in the time interval ${interval.toString()}.`,
      options
    );
  }
}

export class OverlappingBooking extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_booking_type(BookingErrorTypes.OVERLAPPING_BOOKING),
      StatusCodes.CONFLICT,
      'Overlapping booking',
      `You already have a booking that overlaps with the one you are trying to make.\
       To continue, change interval or delete the previous booking.`,
      options
    );
  }
}
