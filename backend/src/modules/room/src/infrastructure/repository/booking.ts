//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import {
  DateTime as NeoDateTime,
  Driver,
  int,
  Integer,
} from 'neo4j-driver-core';
import {
  BookingID,
  Booking,
  BookingInterval,
} from '../../domain/models/booking';
import { SearchOptions } from '../../domain/models/search';
import { RoomID } from '../../domain/models/room';
import { BookingRepository } from '../../domain/ports/booking.repository';

function luxon_to_neo4j(dt: DateTime): NeoDateTime {
  return new NeoDateTime<Integer>(
    int(dt.year),
    int(dt.month),
    int(dt.day),
    int(dt.hour),
    int(dt.minute),
    int(dt.second),
    int(0),
    int(dt.offset)
  );
}

function neo4j_to_luxon(dt: NeoDateTime): DateTime {
  return DateTime.fromISO(dt.toString());
}

function neo4j_to_interval(
  start: NeoDateTime,
  end: NeoDateTime
): BookingInterval {
  const s = neo4j_to_luxon(start);
  const e = neo4j_to_luxon(end);
  return BookingInterval.from_dates(s, e, false);
}

export class Neo4jBookingRepository implements BookingRepository {
  private constructor(private readonly driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jBookingRepository> {
    // TODO: add indexes
    return new Neo4jBookingRepository(driver);
  }

  public async get_user_bookings(
    user_id: UserID,
    booking_ids: BookingID[]
  ): Promise<Booking[]> {
    const session = this.driver.session();
    try {
      const user = user_id.to_string();
      const ids = booking_ids.map((id) => id.to_string());

      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (user:ROOM_User {id: $user})-[booking:ROOM_BOOKING]->(room:ROOM_Room)
           WHERE booking.id in $ids
           RETURN room.id as room, booking.id as id, booking.start as start, booking.end as end`,
          { user, ids }
        )
      );

      const bookings: Booking[] = [];
      res.records.forEach((record) => {
        bookings.push({
          id: BookingID.from_string(record.get('id')),
          room: RoomID.from_string(record.get('room')),
          user: user_id,
          interval: neo4j_to_interval(record.get('start'), record.get('end')),
        });
      });

      return bookings;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_bookings_by_room_interval(
    room_id: RoomID,
    interval: BookingInterval
  ): Promise<Booking[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:ROOM_User)-[b:ROOM_BOOKING]->(r:ROOM_Room { id: $id })
           WHERE ($start <= b.start < b.end) OR ($start < b.end <= $end)
           RETURN u.id as uid, b.id as bid, b.start as start, b.end as end`,
          {
            id: room_id.to_string(),
            start: luxon_to_neo4j(interval.interval.start),
            end: luxon_to_neo4j(interval.interval.end),
          }
        )
      );

      const bookings: Booking[] = res.records.map((record) => ({
        id: BookingID.from_string(record.get('bid')),
        room: room_id,
        user: new UserID(record.get('uid')),
        interval: neo4j_to_interval(record.get('start'), record.get('end')),
      }));

      return bookings;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async search_user_bookings(
    user_id: UserID,
    options: SearchOptions
  ): Promise<BookingID[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:ROOM_User)-[b:ROOM_BOOKING]->(r:ROOM_Room)
           WHERE u.id = $id
           RETURN b.id as id
           ORDER BY b.id
           SKIP $skip
           LIMIT $limit`,
          {
            id: user_id.to_string(),
            limit: int(options.limit),
            skip: int(options.offset),
          }
        )
      );

      const bookings = res.records.map((record) =>
        BookingID.from_string(record.get('id'))
      );

      return bookings;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async search_bookings_by_user_interval(
    user_id: UserID,
    interval: BookingInterval
  ): Promise<BookingID[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:ROOM_User { id: $id })-[b:ROOM_BOOKING]->(r:ROOM_Room)
           WHERE ($start <= b.start < b.end) OR ($start < b.end <= $end)
           RETURN b.id as id`,
          {
            id: user_id.to_string(),
            start: luxon_to_neo4j(interval.interval.start),
            end: luxon_to_neo4j(interval.interval.end),
          }
        )
      );

      const bookings = res.records.map((record) =>
        BookingID.from_string(record.get('id'))
      );
      return bookings;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async create_booking(
    booking: Booking
  ): Promise<BookingID | undefined> {
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = BookingID.generate();
        // eslint-disable-next-line no-await-in-loop
        const bookings = await this.get_user_bookings(booking.user, [id]);
        if (bookings.length === 0) {
          // eslint-disable-next-line no-await-in-loop
          const res = await session.writeTransaction((tx) =>
            tx.run(
              `MATCH (u:ROOM_User), (r:ROOM_Room)
               WHERE u.id = $user_id AND r.id = $room_id
               CREATE (u)-[b:ROOM_BOOKING { id: $booking_id, start: $start, end: $end }]->(r)`,
              {
                user_id: booking.user.to_string(),
                room_id: booking.room.to_string(),
                booking_id: id.to_string(),
                start: luxon_to_neo4j(booking.interval.interval.start),
                end: luxon_to_neo4j(booking.interval.interval.end),
              }
            )
          );

          return res.summary.counters.updates().relationshipsCreated > 0
            ? id
            : undefined;
        }
      }
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async delete_booking(
    user: UserID,
    booking: BookingID
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:ROOM_User)-[booking:ROOM_BOOKING]->(r:ROOM_Room)
           WHERE u.id = $user_id AND booking.id = $booking_id
           DELETE booking`,
          { user_id: user.to_string(), booking_id: booking.to_string() }
        )
      );

      return res.summary.counters.updates().relationshipsDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }
}
