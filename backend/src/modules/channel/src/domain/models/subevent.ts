//
//
//

import { customAlphabet } from 'nanoid';
import { UserID } from '@nextapp/common/user';
import { EventID, Event } from './event';
import { InvalidEventSubID } from '../errors';

/**
 * Identifier for a subscription. It is a string of 10 digits.
 */
export class EventSubID {
  public static readonly LENGTH = 10;

  private constructor(private readonly id: string) {}

  /**
   * Generates a random SubID.
   * @returns
   */
  public static generate(): EventSubID {
    const nanoid = customAlphabet('1234567890', EventSubID.LENGTH);
    return new EventSubID(nanoid());
  }

  /**
   * Creates a BookingEventID from a string.
   * This method throw an error if the given string is not a valid id.
   * @param id
   * @returns
   */
  public static from_string(id: string): EventSubID {
    if (/^[0-9]{10}$/.test(id)) {
      return new EventSubID(id);
    }
    throw new InvalidEventSubID(id);
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: EventSubID): boolean {
    return this.id === other.id;
  }
}

/**
 * Model that contains info about a subscription.
 */
export interface EventSub {
  id?: EventSubID;
  event: EventID;
  user: UserID;
}
