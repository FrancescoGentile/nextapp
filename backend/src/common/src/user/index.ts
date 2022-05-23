//
//
//

import { customAlphabet } from 'nanoid';

/**
 * ID used to identify a user.
 */
export class UserID {
  public static LENGTH = 10;

  public constructor(private readonly id: string) {}

  /**
   * Generates a UserID of 10 digits.
   * @returns
   */
  public static generate(): UserID {
    const nanoid = customAlphabet('1234567890', UserID.LENGTH);
    return new UserID(nanoid());
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: UserID): boolean {
    return this.id === other.id;
  }
}

export enum UserRole {
  SIMPLE,
  SYS_ADMIN,
}
