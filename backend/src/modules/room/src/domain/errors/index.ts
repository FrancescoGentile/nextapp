//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';

export { InternalServerError } from '@nextapp/common/error';

// ---------------------------------------------------------------
// --------------------------- ROOM ------------------------------
// ---------------------------------------------------------------

enum RoomErrorTypes {
  INVALID_SEAT_NUMBER = 1,
  INVALID_FLOOR,
}

function get_room_type(type: RoomErrorTypes): string {
  return `room-${String(type).padStart(3, '0')}`;
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

// ---------------------------------------------------------------
// --------------------------- BOOKING ---------------------------
// ---------------------------------------------------------------

enum BookingErrorTypes {
  INVALID_BOOKING_INTERVAL = 1,
}

function get_booking_type(type: BookingErrorTypes): string {
  return `booking-${String(type).padStart(3, '0')}`;
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
