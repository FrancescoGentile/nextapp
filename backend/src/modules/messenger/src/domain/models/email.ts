//
//
//

import * as EmailValidator from 'email-validator';
import { customAlphabet } from 'nanoid';
import { InvalidEmail, InvalidEmailID } from '../errors';

/**
 * ID associated to each user's email.
 * Each ID is a string of 10 characters.
 */
export class EmailID {
  private constructor(private readonly id: string) {}

  /**
   * Generates a random ID.
   */
  public static generate(): EmailID {
    const nanoid = customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-',
      11
    );
    return new EmailID(nanoid());
  }

  /**
   * Creates a new id from the given string.
   * This method throws an InvalidEmailID if the given id
   * does not match the constraints.
   * @param id
   * @returns
   */
  public static from_string(id: string): EmailID {
    if (!/^[0-9a-zA-Z_-]{11}$/.test(id)) {
      throw new InvalidEmailID(id);
    }

    return new EmailID(id);
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: EmailID): boolean {
    return this.id === other.id;
  }
}

/**
 * Class used to represent a valid (but not necessarily existing) email.
 */
export class EmailAddress {
  private constructor(
    private readonly email: string,
    public readonly main: boolean,
    public readonly id?: EmailID
  ) {}

  /**
   * Creates a new Email from the given string.
   * This method throws an InvalidEmail error
   * if the provided mail is not valid.
   * @param email
   * @returns
   */
  public static from_string(email: string, main: boolean, id?: EmailID) {
    const valid = EmailValidator.validate(email);
    if (!valid) {
      throw new InvalidEmail(email);
    }

    return new EmailAddress(email, main, id);
  }

  public to_string(): string {
    return this.email;
  }

  public equals(other: EmailAddress): boolean {
    return this.email === other.email;
  }
}

export interface Email {
  subject: string;
  text: string;
  html?: string;
}
