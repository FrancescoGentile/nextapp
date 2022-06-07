//
//
//

import { UserID } from '@nextapp/common/user';
import { customAlphabet } from 'nanoid';
import { InvalidParticipationID } from '../errors';
import { EventID } from './event';

export class ParticipationID {
  public static readonly LENGTH = 11;

  private constructor(private readonly id: string) {}

  /**
   * Generate a random EventID.
   * @returns
   */
  public static generate(): ParticipationID {
    const nanoid = customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_',
      ParticipationID.LENGTH
    );
    return new ParticipationID(nanoid());
  }

  public static from_string(id: string): ParticipationID {
    if (/^[0-9a-zA-Z_-]{11}$/.test(id)) {
      return new ParticipationID(id);
    }
    throw new InvalidParticipationID(id);
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: ParticipationID): boolean {
    return this.id === other.id;
  }
}

export interface Participation {
  id?: ParticipationID;
  user_id: UserID;
  event_id: EventID;
}
