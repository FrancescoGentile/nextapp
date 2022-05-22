//
//
//

import { DateTime, Interval } from 'luxon';
import { InvalidInterval } from '../errors';

/**
 * Model to represent an interval of time.
 * The extremes of the interval are UTC dates and times.
 */
export class NextInterval {
  // minimum interval length in minutes
  public static readonly MIN_INTERVAL: number = 15;

  // maximum interval length in minutes
  public static readonly MAX_INTERVAL: number = 1440;

  // length of a single slot
  public static readonly SLOT_LENGTH: number = 15;

  protected constructor(public readonly interval: Interval) {}

  public get start(): DateTime {
    return this.interval.start;
  }

  public get end(): DateTime {
    return this.interval.end;
  }

  /**
   * Creates a search interval given its start and end.
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
  ): NextInterval {
    const utc_start = start.toUTC();
    const utc_end = end.toUTC();
    let utc_interval;
    try {
      utc_interval = Interval.fromDateTimes(utc_start, utc_end);
    } catch {
      throw new InvalidInterval(`The interval start cannot be after its end.`);
    }

    return NextInterval.from_interval(utc_interval, after_now);
  }

  /**
   * Creates a search interval given a luxon interval.
   * This method assumes that the interval extremes are UTC dates and times.
   * This method throws an error if the interval is shorter than MIN_INTERVAL minutes
   * or longer than MAX_INTERVAL minutes or if it is not a multiple of n slots.
   * If after_now is true, an error is thrown if the interval is not after the current time.
   * @param interval
   * @param after_now if the interval should be after now (default value = false)
   */
  protected static from_interval(
    interval: Interval,
    after_now: boolean = false
  ): NextInterval {
    const length = interval.length('minutes');
    if (
      length < NextInterval.MIN_INTERVAL ||
      length > NextInterval.MAX_INTERVAL
    ) {
      throw new InvalidInterval(
        `An interval should have a minimum length of ${NextInterval.MIN_INTERVAL} ` +
          `minutes and a maximum length of ${NextInterval.MAX_INTERVAL} minutes.`
      );
    }

    if (after_now && interval.start.diff(DateTime.utc()).milliseconds < 0) {
      throw new InvalidInterval(
        'For this operation, you cannot pass a past interval.'
      );
    }

    const { start, end } = interval;
    if (
      start.second !== 0 ||
      start.minute % NextInterval.SLOT_LENGTH !== 0 ||
      end.second !== 0 ||
      end.minute % NextInterval.SLOT_LENGTH !== 0
    ) {
      throw new InvalidInterval(
        `Interval extremes can only be multiples of ${NextInterval.SLOT_LENGTH} minutes.`
      );
    }

    return new NextInterval(interval);
  }

  /**
   * Returns the time offset in number of SLOTS between the starts of the two intervals
   * and the length in number of SLOTS of their intersection.
   * Offset is undefined if the two intervals do not overlap.
   * @param other
   * @returns
   */
  public overlaps(other: NextInterval): {
    offset?: number;
    length: number;
  } {
    const inters = this.interval.intersection(other.interval);
    if (inters === null) {
      return { offset: undefined, length: 0 };
    }
    const offset =
      inters.start.diff(this.interval.start, 'minutes').minutes /
      NextInterval.SLOT_LENGTH;
    const length = inters.length('minutes') / NextInterval.SLOT_LENGTH;
    return { offset, length };
  }
}
