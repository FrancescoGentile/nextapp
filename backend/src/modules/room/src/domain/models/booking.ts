//
//
//

import { customAlphabet } from 'nanoid';
import { UserID } from '@nextapp/common/user';
import { RoomID, Room } from './room';
import { InvalidBookingID } from '../errors';
import { NextInterval } from './interval';

/**
 * Identifier for a booking. It is a string of 10 digits.
 */
export class BookingID {
  public static readonly LENGTH = 10;

  private constructor(private readonly id: string) {}

  /**
   * Generates a random BookingID.
   * @returns
   */
  public static generate(): BookingID {
    const nanoid = customAlphabet('1234567890', BookingID.LENGTH);
    return new BookingID(nanoid());
  }

  /**
   * Creates a BookingID from a string.
   * This method throw an error if the given string is not a valid id.
   * @param id
   * @returns
   */
  public static from_string(id: string): BookingID {
    if (/^[0-9]{10}$/.test(id)) {
      return new BookingID(id);
    }
    throw new InvalidBookingID(id);
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: BookingID): boolean {
    return this.id === other.id;
  }
}

/**
 * Model that contains info about a booking.
 */
export interface Booking {
  id?: BookingID;
  room: RoomID;
  user: UserID;
  interval: NextInterval;
}

/**
 * Returns if the room is available in the given interval
 * given the current bookings for that room.
 * @param room
 * @param current_bookings
 * @param interval
 */
export function check_availability(
  room: Room,
  current_bookings: Booking[],
  interval: NextInterval
): boolean {
  const steps: number[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const booking of current_bookings) {
    const { offset, length } = interval.overlaps(booking.interval);
    if (offset !== undefined) {
      for (let index = offset; index < offset + length; index += 1) {
        if (steps[index] === undefined) {
          steps[index] = room.seats - 1;
        } else if (steps[index] === 1) {
          return false;
        } else {
          steps[index] -= 1;
        }
      }
    }
  }

  return true;
}

/**
 * Returns for each slot of time from the start of interval to its end
 * how many places are available in the room given the current bookings.
 * @param room
 * @param current_bookings
 * @param interval
 */
export function get_availability(
  room: Room,
  current_bookings: Booking[],
  interval: NextInterval
): number[] {
  const slots = interval.interval.length('minutes') / NextInterval.SLOT_LENGTH;
  const steps: number[] = Array.from({ length: slots }, () => room.seats);

  // eslint-disable-next-line no-restricted-syntax
  for (const booking of current_bookings) {
    const { offset, length } = interval.overlaps(booking.interval);
    if (offset !== undefined) {
      for (let index = offset; index < offset + length; index += 1) {
        steps[index] -= 1;
      }
    }
  }

  return steps;
}
