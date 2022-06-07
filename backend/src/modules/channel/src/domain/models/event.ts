//
//
//

import { customAlphabet } from 'nanoid';
import {
  InvalidEventID,
  InvalidEventName,
  InvalidEventDescription,
} from '../errors';
import { ChannelID } from './channel';
import { NextInterval } from './interval';

export class EventID {
  public static readonly LENGTH = 11;

  private constructor(private readonly id: string) {}

  /**
   * Generate a random EventID.
   * @returns
   */
  public static generate(): EventID {
    const nanoid = customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_',
      EventID.LENGTH
    );
    return new EventID(nanoid());
  }

  public static from_string(id: string): EventID {
    if (/^[0-9a-zA-Z_-]{11}$/.test(id)) {
      return new EventID(id);
    }
    throw new InvalidEventID(id);
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: EventID): boolean {
    return this.id === other.id;
  }
}

export class RoomID {
  public constructor(private readonly id: string) {}

  public to_string(): string {
    return this.id;
  }
}

export class Event {
  public id?: EventID;

  public readonly channel: ChannelID;

  public readonly name: string;

  public readonly description: string;

  public readonly interval: NextInterval;

  public readonly room: RoomID;

  public readonly seats: number;

  public constructor(
    channel: ChannelID,
    name: string,
    description: string,
    interval: NextInterval,
    room: RoomID,
    seats: number,
    id?: EventID
  ) {
    if (name.trim() === '' || name.length > 100) {
      throw new InvalidEventName();
    }

    if (description.trim() === '' || description.length > 5000) {
      throw new InvalidEventDescription();
    }

    this.channel = channel;
    this.name = name;
    this.description = description;
    this.interval = interval;
    this.room = room;
    this.seats = seats;
    this.id = id;
  }

  public set_id(id: EventID) {
    this.id = id;
  }
}
