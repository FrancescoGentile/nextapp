//
//
//

import { customAlphabet } from 'nanoid';
import { UserID } from '@nextapp/common/user';
import { ChannelID, Channel } from './channel';
import { InvalidSubID } from '../errors';

/**
 * Identifier for a subscription. It is a string of 10 digits.
 */
export class SubID {
  public static readonly LENGTH = 10;

  private constructor(private readonly id: string) {}

  /**
   * Generates a random SubID.
   * @returns
   */
  public static generate(): SubID {
    const nanoid = customAlphabet('1234567890', SubID.LENGTH);
    return new SubID(nanoid());
  }

  /**
   * Creates a BookingID from a string.
   * This method throw an error if the given string is not a valid id.
   * @param id
   * @returns
   */
  public static from_string(id: string): SubID {
    if (/^[0-9]{10}$/.test(id)) {
      return new SubID(id);
    }
    throw new InvalidSubID(id);
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: SubID): boolean {
    return this.id === other.id;
  }
}

/**
 * Model that contains info about a subscription.
 */
export interface Sub {
  id?: SubID;
  channel: ChannelID;
  user: UserID;
}
