//
//
//

import * as EmailValidator from 'email-validator';
import { InvalidEmail } from '../errors';

/**
 * Class used to represent a valid (but not necessarily existing) email.
 */
export class Email {
  private constructor(private readonly email: string) {}

  /**
   * Creates a new Email from the given string.
   * This method throws an InvalidEmail error
   * if the provided mail is not valid.
   * @param email
   * @returns
   */
  public static from_string(email: string) {
    const valid = EmailValidator.validate(email);
    if (!valid) {
      throw new InvalidEmail(email);
    }

    return new Email(email);
  }

  public to_string(): string {
    return this.email;
  }
}
