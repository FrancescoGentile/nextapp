/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import {
  InternalServerError,
  InvalidFloor,
  RoomCreationNotAuthorized,
  RoomDeletionNotAuthorized,
  RoomNameAlreadyUsed,
  RoomNotFound,
} from '../errors';
import { check_availability, get_availability } from '../models/booking';
import { BuildingInfo } from '../models/building';
import { NextInterval } from '../models/interval';
import { RoomID, Room } from '../models/room';
import { SearchOptions } from '../models/search';
import { BookingRepository } from '../ports/booking.repository';
import { RoomRepository } from '../ports/room.repository';
import { RoomInfoService } from '../ports/room.service';
import { UserRepository } from '../ports/user.repository';

export class NextRoomInfoService implements RoomInfoService {
  public constructor(
    private readonly room_repo: RoomRepository,
    private readonly booking_repo: BookingRepository,
    private readonly user_repo: UserRepository
  ) {}

  // eslint-disable-next-line class-methods-use-this
  public async get_floors(): Promise<number[]> {
    return BuildingInfo.FLOORS;
  }

  public async get_available_slots(
    room_id: RoomID,
    start: DateTime,
    end: DateTime
  ): Promise<{ interval: NextInterval; seats: number }[]> {
    const interval = NextInterval.from_dates(start, end, true);
    const room = await this.room_repo.get_room(room_id);
    if (room === null) {
      throw new RoomNotFound(room_id.to_string());
    }
    const bookings = await this.booking_repo.get_bookings_by_room_interval(
      room_id,
      interval
    );

    const slots: { interval: NextInterval; seats: number }[] = [];

    const available_seats = get_availability(room, bookings, interval);
    const { length } = available_seats;

    for (let i = 0; i < length; ) {
      if (available_seats[i] <= 0) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const s = i;
      let e = i + 1;
      for (
        ;
        e < length &&
        available_seats[e] > 0 &&
        available_seats[e] === available_seats[e - 1];
        e += 1
      );

      const int_start = start.plus({ minutes: s * NextInterval.SLOT_LENGTH });
      const int_end = start.plus({ minutes: e * NextInterval.SLOT_LENGTH });

      slots.push({
        interval: NextInterval.from_dates(int_start, int_end),
        seats: available_seats[e - 1],
      });

      i = e;
    }

    return slots;
  }

  public async get_room(id: RoomID): Promise<Room> {
    const room = await this.room_repo.get_room(id);
    if (room === null) {
      throw new RoomNotFound(id.to_string());
    }
    return room;
  }

  public async search_rooms(
    options: SearchOptions,
    floor?: number,
    interv?: { start: DateTime; end: DateTime }
  ): Promise<Room[]> {
    if (floor !== undefined && !BuildingInfo.is_valid(floor)) {
      throw new InvalidFloor(BuildingInfo.FLOORS);
    }

    if (interv === undefined) {
      return this.room_repo.search_rooms(options, floor);
    }

    const interval = NextInterval.from_dates(interv.start, interv.end, true);
    const res: Room[] = [];
    let opt = options;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const rooms = await this.room_repo.search_rooms(options, floor);

      for (const room of rooms) {
        const available = await this.check_availability(room, interval);
        if (available) {
          res.push(room);

          if (res.length >= options.limit) {
            return res;
          }
        }
      }

      if (rooms.length < opt.limit) {
        return res;
      }

      opt = SearchOptions.build(
        opt.offset + opt.limit,
        options.limit - res.length
      );
    }
  }

  private async check_availability(
    room: Room,
    interval: NextInterval
  ): Promise<boolean> {
    const bookings = await this.booking_repo.get_bookings_by_room_interval(
      room.id!,
      interval
    );
    return check_availability(room, bookings, interval);
  }

  public async create_room(admin: UserID, room: Room): Promise<RoomID> {
    if (!(await this.is_admin(admin))) {
      throw new RoomCreationNotAuthorized();
    }

    const id = await this.room_repo.create_room(room);
    if (id === undefined) {
      throw new RoomNameAlreadyUsed(room.name);
    }
    return id;
  }

  public async update_room(
    admin: UserID,
    room_id: RoomID,
    name?: string,
    details?: any,
    floor?: number
  ): Promise<void> {
    if (!(await this.is_admin(admin))) {
      throw new RoomDeletionNotAuthorized();
    }

    if (name === undefined && details === undefined && floor === undefined) {
      return;
    }

    const room = await this.room_repo.get_room(room_id);
    if (room === null) {
      throw new RoomNotFound(room_id.to_string());
    }

    let new_details = room.details;
    if (details === null) {
      new_details = null;
    } else if (details !== undefined) {
      Object.assign(new_details, details);
    }
    const new_room = new Room(
      name ?? room.name,
      new_details,
      room.seats,
      floor ?? room.floor,
      room.id
    );

    const updated = await this.room_repo.update_room(new_room);
    if (!updated) {
      throw new RoomNameAlreadyUsed(new_room.name);
    }
  }

  public async delete_room(admin: UserID, room_id: RoomID): Promise<void> {
    if (!(await this.is_admin(admin))) {
      throw new RoomDeletionNotAuthorized();
    }

    const deleted = await this.room_repo.delete_room(room_id);
    if (!deleted) {
      throw new RoomNotFound(room_id.to_string());
    }
  }

  private async is_admin(user_id: UserID): Promise<boolean> {
    const role = await this.user_repo.get_user_role(user_id);
    if (role === null) {
      // the user with the given id has still not been created
      throw new InternalServerError();
    }
    return role === UserRole.SYS_ADMIN;
  }
}