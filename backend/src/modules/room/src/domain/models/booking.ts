//
//
//

import { customAlphabet } from 'nanoid';
import { UserID } from '@nextapp/common/user';
import { DateTime, Interval } from 'luxon';
import { RoomID, Room } from './room';
import { InvalidBookingInterval } from '../errors';

/**
 * Identifier for a booking.
 */
export class BookingID {
  public static readonly LENGTH = 10;

  public constructor(private readonly id: string) {}

  /**
   * Returns a BookingID of 10 digits.
   * @returns
   */
  public static generate(): BookingID {
    const nanoid = customAlphabet('1234567890', BookingID.LENGTH);
    return new BookingID(nanoid());
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: BookingID): boolean {
    return this.id === other.id;
  }
}

/**
 * Model to represent an interval for a booking.
 */
export class BookingInterval {
  // minimum interval length in minutes
  public static readonly MIN_INTERVAL: number = 15;

  // maximum interval length in minutes
  public static readonly MAX_INTERVAL: number = 1440;

  // length of a single slot
  public static readonly SLOT_LENGTH: number = 15;

  private constructor(public readonly interval: Interval) {}

  /**
   * Creates a booking interval given its start and end.
   * This method throws an error if the interval is shorter than MIN_INTERVAL minutes
   * or longer than MAX_INTERVAL minutes or if it is not a multiple of n slots.
   * If after_now is true, an error is thrown if the interval is not after the current time.
   * @param start
   * @param end
   * @param after_now if the interval should be after now (default value = false)
   */
  public static from_dates(
    start: DateTime,
    end: DateTime,
    after_now: boolean = false
  ): BookingInterval {
    const interval = Interval.fromDateTimes(start, end);
    return BookingInterval.from_interval(interval, after_now);
  }

  /**
   * Creates a booking interval given a luxon interval.
   * This method throws an error if the interval is shorter than MIN_INTERVAL minutes
   * or longer than MAX_INTERVAL minutes or if it is not a multiple of n slots.
   * If after_now is true, an error is thrown if the interval is not after the current time.
   * @param interval
   * @param after_now if the interval should be after now (default value = false)
   */
  public static from_interval(
    interval: Interval,
    after_now: boolean = false
  ): BookingInterval {
    const length = interval.length('minutes');
    if (
      length < BookingInterval.MIN_INTERVAL ||
      length > BookingInterval.MAX_INTERVAL
    ) {
      throw new InvalidBookingInterval(
        `A booking interval should have a min length of ${BookingInterval.MIN_INTERVAL}\
        minutes and a maximum length of ${this.MAX_INTERVAL} minutes.`
      );
    }

    if (after_now && interval.start.diff(DateTime.now()).seconds < 0) {
      throw new InvalidBookingInterval(
        'Cannot create a booking the current instant of time.'
      );
    }

    const { start, end } = interval;
    if (
      start.second !== 0 ||
      start.minute % BookingInterval.SLOT_LENGTH !== 0 ||
      end.second !== 0 ||
      end.minute % BookingInterval.SLOT_LENGTH !== 0
    ) {
      throw new InvalidBookingInterval(
        `Interval extremes can only be multiples of ${BookingInterval.SLOT_LENGTH} minutes.`
      );
    }

    return new BookingInterval(interval);
  }

  /**
   * Returns the time offset in number of SLOTS between the starts of the two intervals
   * and the length in number of SLOTS of their intersection.
   * Offset is undefined if the two intervals do not overlap.
   * @param other
   * @returns
   */
  public overlaps(other: BookingInterval): {
    offset?: number;
    length: number;
  } {
    const inters = this.interval.intersection(other.interval);
    if (inters === null) {
      return { offset: undefined, length: 0 };
    }
    const offset = inters.start.diff(this.interval.start, 'minutes').minutes;
    const length = inters.length('minutes');
    return { offset, length };
  }
}

/**
 * Model that contains info about a booking.
 */
export interface Booking {
  id?: BookingID;
  room: RoomID;
  user: UserID;
  interval: BookingInterval;
}

/**
 * Returns if a new booking can be added to the list of current booking.
 * @param room
 * @param current_bookings
 * @param new_booking
 */
export function check_availability(
  room: Room,
  current_bookings: Booking[],
  new_booking: Booking
): boolean {
  const steps: number[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const booking of current_bookings) {
    const { offset, length } = new_booking.interval.overlaps(booking.interval);
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
