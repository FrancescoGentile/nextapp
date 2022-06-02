//
//
//

import { customAlphabet } from 'nanoid';

export class RoomID {
  public static LENGTH = 10;

  public constructor(private readonly id: string) {}

  /**
   * Generates a UserID of 10 digits.
   * @returns
   */
  
  public static generate(): RoomID {
    const nanoid = customAlphabet('1234567890', RoomID.LENGTH);
    return new RoomID(nanoid());
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: RoomID): boolean {
    return this.id === other.id;
  }
}

