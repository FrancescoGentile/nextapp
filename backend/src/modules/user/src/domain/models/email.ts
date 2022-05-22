//
//
//

import * as EmailValidator from 'email-validator';
import { InvalidEmail } from '../errors/errors.index';

export class Email {
  private constructor(private readonly email: string) {}

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