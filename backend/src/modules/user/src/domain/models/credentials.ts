//
//
//

import * as argon2 from 'argon2';
import { customAlphabet } from 'nanoid';
import zxcvbn from 'zxcvbn';
import { InvalidPassword, InvalidUsername } from '../errors';

/**
 * Username is used to uniquely identify a user in NextApp.
 * A username is a string of length between 5 and 100 characters,
 * consisting only of lowercase and uppercase Latin letters, Arabic numerals and underscores.
 */
export class Username {
  private constructor(private readonly username: string) {}

  /**
   * Creates a username from the given string.
   * This method throws an error if the passed string does not match
   * the requirements to be a username.
   * @param username
   * @returns
   */
  public static from_string(username: string): Username {
    if (/^[a-zA-Z0-9_]{5,100}$/.test(username)) {
      return new Username(username);
    }
    throw new InvalidUsername(username);
  }

  public to_string(): string {
    return this.username;
  }
}

/**
 * Class used to store a hashed password.
 * This class uses 'argon2id' as hashing algorithm.
 */
export class Password {
  private constructor(private readonly password: string) {}

  /**
   * Creates a hashed password from the passed string.
   * @param password
   * @param username
   * @returns
   */
  public static async from_clear(
    password: string,
    username: Username
  ): Promise<Password> {
    const res = zxcvbn(password, [username.to_string()]);
    if (res.score < 3) {
      throw new InvalidPassword(res.feedback.warning.toString());
    }
    const hash = await argon2.hash(password);
    return new Password(hash);
  }

  public static from_hash(password: string): Password {
    return new Password(password);
  }

  public to_string(): string {
    return this.password;
  }

  public async verify(password: string): Promise<boolean> {
    return argon2.verify(this.password, password);
  }
}

export function generate_password(): string {
  const nanoid = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ?!',
    15
  );

  return nanoid();
}

export interface Credentials {
  username: Username;
  password: Password;
}
