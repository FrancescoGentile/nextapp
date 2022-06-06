//
//
//

import { customAlphabet } from 'nanoid';
import { DateTime } from 'luxon';
import { InvalidDeviceID } from '../errors';
import { NotificationToken } from './notification';

/**
 * ID associated to each user's device.
 * Each ID is a string of 10 digits.
 */
export class WebDeviceID {
  private constructor(private readonly id: string) {}

  /**
   * Generates a random ID.
   */
  public static generate(): WebDeviceID {
    const nanoid = customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-',
      11
    );
    return new WebDeviceID(nanoid());
  }

  /**
   * Creates a new id from the given string.
   * This method throws an InvalidDeviceID if the given id
   * does not match the constraints.
   * @param id
   * @returns
   */
  public static from_string(id: string): WebDeviceID {
    if (!/^[0-9a-zA-Z_-]{11}$/.test(id)) {
      throw new InvalidDeviceID(id);
    }

    return new WebDeviceID(id);
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: WebDeviceID): boolean {
    return this.id === other.id;
  }
}

/**
 * ID used by the frontend to uniquely identify a device.
 */
export class WebDeviceFingerprint {
  public constructor(private readonly id: string) {}

  public to_string(): string {
    return this.id;
  }
}

/**
 * Information associated to a web device.
 */
export interface WebDevice {
  id?: WebDeviceID;
  fingerprint?: WebDeviceFingerprint;
  token: NotificationToken;
  name: string;
  timestamp: DateTime;
}
