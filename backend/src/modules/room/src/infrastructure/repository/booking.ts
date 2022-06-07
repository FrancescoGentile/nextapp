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
import { BookingID, Booking, OrganiserID } from '../../domain/models/booking';
import { SearchOptions } from '../../domain/models/search';
import { RoomID } from '../../domain/models/room';
import { BookingRepository } from '../../domain/ports/booking.repository';
import { NextInterval } from '../../domain/models/interval';

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

function neo4j_to_interval(start: NeoDateTime, end: NeoDateTime): NextInterval {
  const s = neo4j_to_luxon(start);
  const e = neo4j_to_luxon(end);
  return NextInterval.from_dates(s, e, false);
}

export class Neo4jBookingRepository implements BookingRepository {
  private constructor(private readonly driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jBookingRepository> {
    // TODO: add indexes
    return new Neo4jBookingRepository(driver);
  }

  private async get_organiser_booking(
    organiser: OrganiserID,
    booking_id: BookingID
  ): Promise<Booking | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (o:ROOM_Organiser {id: $org})-[booking:ROOM_BOOKING]->(room:ROOM_Room)
           WHERE booking.id = $id
           RETURN room.id as room, booking`,
          { org: organiser.to_string(), id: booking_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const record = res.records[0];
      const { id, seats, start, end } = record.get('booking').properties;
      return {
        id: BookingID.from_string(id),
        room: RoomID.from_string(record.get('room')),
        customer: organiser,
        seats: seats.toNumber(),
        interval: neo4j_to_interval(start, end),
      };
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_user_booking(
    user_id: UserID,
    booking_id: BookingID
  ): Promise<Booking | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (user:ROOM_User {id: $user})-[booking:ROOM_BOOKING]->(room:ROOM_Room)
           WHERE booking.id = $id
           RETURN room.id as room, booking`,
          { user: user_id.to_string(), id: booking_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const record = res.records[0];
      const { id, seats, start, end } = record.get('booking').properties;
      return {
        id: BookingID.from_string(id),
        room: RoomID.from_string(record.get('room')),
        customer: user_id,
        seats: seats.toNumber(),
        interval: neo4j_to_interval(start, end),
      };
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_bookings_by_room_interval(
    room_id: RoomID,
    interval: NextInterval
  ): Promise<Booking[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (c)-[b:ROOM_BOOKING]->(r:ROOM_Room { id: $id })
           WHERE b.start < $end AND b.end > $start
           RETURN c, b`,
          {
            id: room_id.to_string(),
            start: luxon_to_neo4j(interval.start),
            end: luxon_to_neo4j(interval.end),
          }
        )
      );

      const bookings: Booking[] = res.records.map((record) => {
        const c_id = record.get('c').properties.id;
        const customer =
          record.get('c').labels[0] === 'ROOM_User'
            ? new UserID(c_id)
            : new OrganiserID(c_id);

        const { id, seats, start, end } = record.get('b').properties;
        return {
          id: BookingID.from_string(id),
          room: room_id,
          customer,
          seats: seats.toNumber(),
          interval: neo4j_to_interval(start, end),
        };
      });

      return bookings;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async search_user_bookings(
    user_id: UserID,
    interval: NextInterval,
    options: SearchOptions
  ): Promise<Booking[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:ROOM_User { id: $id })-[b:ROOM_BOOKING]->(r:ROOM_Room)
           WHERE b.start < $end AND b.end > $start
           RETURN r.id as rid, b
           ORDER BY b.id
           SKIP $skip
           LIMIT $limit`,
          {
            id: user_id.to_string(),
            start: luxon_to_neo4j(interval.start),
            end: luxon_to_neo4j(interval.end),
            limit: int(options.limit),
            skip: int(options.offset),
          }
        )
      );

      const bookings: Booking[] = res.records.map((record) => {
        const { id, seats, start, end } = record.get('b').properties;
        return {
          id: BookingID.from_string(id),
          room: RoomID.from_string(record.get('rid')),
          customer: user_id,
          seats: seats.toNumber(),
          interval: neo4j_to_interval(start, end),
        };
      });

      return bookings;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  private async create_organiser_booking(
    booking: Booking
  ): Promise<BookingID | undefined> {
    if (booking.customer instanceof UserID) {
      return undefined;
    }
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = BookingID.generate();
        // eslint-disable-next-line no-await-in-loop
        const bookings = await this.get_organiser_booking(booking.customer, id);
        if (bookings === null) {
          // eslint-disable-next-line no-await-in-loop
          const res = await session.writeTransaction((tx) =>
            tx.run(
              `MATCH (r:ROOM_Room { id: $room_id })
               MERGE (o:ROOM_Organiser { id: $org_id })-[:ROOM_BOOKING { id: $booking_id, seats: $seats, start: $start, end: $end }]->(r)`,
              {
                room_id: booking.room.to_string(),
                org_id: booking.customer.to_string(),
                booking_id: id.to_string(),
                seats: int(booking.seats),
                start: luxon_to_neo4j(booking.interval.start),
                end: luxon_to_neo4j(booking.interval.end),
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

  private async create_user_booking(
    booking: Booking
  ): Promise<BookingID | undefined> {
    if (booking.customer instanceof OrganiserID) {
      return undefined;
    }
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = BookingID.generate();
        // eslint-disable-next-line no-await-in-loop
        const bookings = await this.get_user_booking(booking.customer, id);
        if (bookings === null) {
          // eslint-disable-next-line no-await-in-loop
          const res = await session.writeTransaction((tx) =>
            tx.run(
              `MATCH (u:ROOM_User), (r:ROOM_Room)
               WHERE u.id = $user_id AND r.id = $room_id
               CREATE (u)-[b:ROOM_BOOKING { id: $booking_id, seats: $seats, start: $start, end: $end }]->(r)`,
              {
                user_id: booking.customer.to_string(),
                room_id: booking.room.to_string(),
                booking_id: id.to_string(),
                seats: int(booking.seats),
                start: luxon_to_neo4j(booking.interval.start),
                end: luxon_to_neo4j(booking.interval.end),
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

  public async create_booking(
    booking: Booking
  ): Promise<BookingID | undefined> {
    if (booking.customer instanceof UserID) {
      return this.create_user_booking(booking);
    }
    return this.create_organiser_booking(booking);
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

  public async delete_organiser_booking(
    organiser: OrganiserID,
    booking_id: BookingID
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (o:ROOM_Organiser)-[booking:ROOM_BOOKING]->(r:ROOM_Room)
           WHERE o.id = $org_id AND booking.id = $booking_id
           DELETE booking`,
          { org_id: organiser.to_string(), booking_id: booking_id.to_string() }
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
