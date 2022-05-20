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
  ): Promise<NextInterval[]> {
    const interval = NextInterval.from_dates(start, end);
    const rooms = await this.room_repo.get_rooms([room_id]);
    if (rooms.length === 0) {
      throw new RoomNotFound(room_id.to_string());
    }
    const room = rooms[0];
    const bookings = await this.booking_repo.get_bookings_by_room_interval(
      room_id,
      interval
    );

    const slots: NextInterval[] = [];

    const available_seats = get_availability(room, bookings, interval);
    const { length } = available_seats;

    for (let i = 0; i < length; i += 1) {
      if (available_seats[i] <= 0) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const s = i;
      let e = i + 1;
      for (; e < length && available_seats[e] > 0; e += 1);

      const int_start = start.plus({ minutes: s * NextInterval.SLOT_LENGTH });
      const int_end = start.plus({ minutes: e * NextInterval.SLOT_LENGTH });

      slots.push(NextInterval.from_dates(int_start, int_end));

      i = e + 1;
    }

    return slots;
  }

  public async get_rooms(ids: RoomID[]): Promise<Room[]> {
    return this.room_repo.get_rooms(ids);
  }

  public async search_rooms(options: SearchOptions): Promise<RoomID[]> {
    return this.room_repo.search_rooms(options);
  }

  public async search_rooms_by_floor(
    floor: number,
    options: SearchOptions
  ): Promise<RoomID[]> {
    if (!BuildingInfo.is_valid(floor)) {
      throw new InvalidFloor(BuildingInfo.FLOORS);
    }
    return this.room_repo.search_rooms_by_floor(floor, options);
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

  public async search_rooms_by_availability(
    start: DateTime,
    end: DateTime,
    options: SearchOptions
  ): Promise<RoomID[]> {
    const interval = NextInterval.from_dates(start, end, true);
    const res: RoomID[] = [];
    let opt = options;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const ids = await this.room_repo.search_rooms(options);
      const rooms = await this.room_repo.get_rooms(ids);

      for (const room of rooms) {
        const available = await this.check_availability(room, interval);
        if (available) {
          res.push(room.id!);

          if (res.length >= options.limit) {
            return res;
          }
        }
      }

      opt = SearchOptions.build(
        opt.offset + opt.limit,
        options.limit - res.length
      );
    }
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
