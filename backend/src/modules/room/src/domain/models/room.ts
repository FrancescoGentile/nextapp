//
//
//

import { customAlphabet } from 'nanoid';
import {
  InvalidFloor,
  InvalidRoomID,
  InvalidRoomName,
  InvalidSeatNumber,
} from '../errors';

/**
 * Identifier for a room. It is a string of 10 digits.
 */
export class RoomID {
  public static readonly LENGTH = 10;

  private constructor(private readonly id: string) {}

  /**
   * Generate a random RoomID.
   * @returns
   */
  public static generate(): RoomID {
    const nanoid = customAlphabet('1234567890', RoomID.LENGTH);
    return new RoomID(nanoid());
  }

  public static from_string(id: string): RoomID {
    if (/^[0-9]{10}$/.test(id)) {
      return new RoomID(id);
    }
    throw new InvalidRoomID(id);
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: RoomID): boolean {
    return this.id === other.id;
  }
}

/**
 * Model used to containt the information of a room.
 */
export class Room {
  // Ehen a new room is created the id is undefined,
  // it will set by the repository to assure that it is unique
  public id?: RoomID;

  // each room has a unique name
  // name must be a string between 5 and 30 characters
  // consisting only of digits, Latin letters, '_' and '-'
  public readonly name: string;

  // Description should be a string or an object who properties
  // correpond to the room properties
  public readonly details: any;

  // Seats must be an integer greater than 0.
  public readonly seats: number;

  // Seats must be an integer greater than or equal to 0
  // and less than or equal to MAX_FLOOR
  public readonly floor: number;

  // This is the max floor at Nest. At the moment, we hardcode it
  // but in a future version we will add it into the database
  public static readonly MAX_FLOOR: number = 4;

  /**
   * This constructor fails if the passed argument do not meet
   * the constraints on name, seats and floor.
   * @param name
   * @param details
   * @param seats
   * @param floor
   * @param id
   */
  public constructor(
    name: string,
    details: any,
    seats: number,
    floor: number,
    id?: RoomID
  ) {
    if (!/^[a-zA-Z0-9_-]{5,100}$/.test(name)) {
      throw new InvalidRoomName(name);
    }
    if (!Number.isInteger(seats) || seats < 1) {
      throw new InvalidSeatNumber();
    }
    if (!Number.isInteger(floor) || floor < 0 || floor > Room.MAX_FLOOR) {
      throw new InvalidFloor(0, Room.MAX_FLOOR);
    }

    this.seats = seats;
    this.floor = floor;
    this.name = name;
    this.details = details;
    this.id = id;
  }

  public set_id(id: RoomID) {
    this.id = id;
  }
}
