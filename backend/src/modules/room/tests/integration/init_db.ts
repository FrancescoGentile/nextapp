/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
//
//
//

import { int, DateTime as NeoDateTime, Integer } from 'neo4j-driver-core';
import neo4j, { Driver } from 'neo4j-driver';
import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { DateTime } from 'luxon';
import { Room, RoomID } from '../../src/domain/models/room';
import { User } from '../../src/domain/models/user';
import { Booking, BookingID } from '../../src/domain/models/booking';
import { NextInterval } from '../../src/domain/models/interval';

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

async function populate_users(driver: Driver): Promise<User[]> {
  const users: User[] = [
    { id: new UserID('1111111111'), role: UserRole.SYS_ADMIN },
    { id: new UserID('2222222222'), role: UserRole.SIMPLE },
    { id: new UserID('3333333333'), role: UserRole.SIMPLE },
    { id: new UserID('4444444444'), role: UserRole.SIMPLE },
  ];

  for (const user of users) {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(`CREATE (u:ROOM_User { id: $id, admin: $admin })`, {
          id: user.id.to_string(),
          admin: user.role === UserRole.SYS_ADMIN,
        })
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  return users;
}

async function populate_rooms(driver: Driver): Promise<Room[]> {
  const rooms: Room[] = [
    new Room('Room1', undefined, 2, 1, RoomID.from_string('1111111111')),
    new Room('Room2', undefined, 10, 2, RoomID.from_string('2222222222')),
    new Room('Room3', undefined, 1, 2, RoomID.from_string('3333333333')),
  ];

  for (const room of rooms) {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE (r:ROOM_Room {
            id: $id, 
            name: $name,
            seats: $seats,
            floor: $floor })`,
          {
            id: room.id!.to_string(),
            name: room.name,
            seats: int(room.seats),
            floor: int(room.floor),
          }
        )
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  return rooms;
}

async function populate_bookings(
  driver: Driver,
  users: User[],
  rooms: Room[]
): Promise<Booking[]> {
  const base = DateTime.utc().startOf('hour');
  const bookings: Booking[] = [
    {
      id: BookingID.from_string('1111111111'),
      customer: users[0].id,
      room: rooms[0].id!,
      seats: 1,
      interval: NextInterval.from_dates(base, base.plus({ hours: 5 })),
    },
    {
      id: BookingID.from_string('2222222222'),
      customer: users[1].id,
      room: rooms[0].id!,
      seats: 1,
      interval: NextInterval.from_dates(base, base.plus({ hours: 3 })),
    },
    {
      id: BookingID.from_string('3333333333'),
      customer: users[2].id,
      room: rooms[1].id!,
      seats: 1,
      interval: NextInterval.from_dates(
        base.minus({ hours: 4 }),
        base.minus({ hours: 1 })
      ),
    },
    {
      id: BookingID.from_string('4444444444'),
      customer: users[3].id,
      room: rooms[2].id!,
      seats: 1,
      interval: NextInterval.from_dates(base, base.plus({ hours: 10 })),
    },
  ];

  for (const booking of bookings) {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:ROOM_User), (r:ROOM_Room)
           WHERE u.id = $user_id AND r.id = $room_id
           CREATE (u)-[b:ROOM_BOOKING { id: $booking_id, seats: $seats, start: $start, end: $end }]->(r)`,
          {
            user_id: booking.customer.to_string(),
            room_id: booking.room.to_string(),
            booking_id: booking.id!.to_string(),
            seats: int(booking.seats),
            start: luxon_to_neo4j(booking.interval.start),
            end: luxon_to_neo4j(booking.interval.end),
          }
        )
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  return bookings;
}

export async function populate_db(driver: Driver): Promise<{
  users: User[];
  rooms: Room[];
  bookings: Booking[];
}> {
  const [users, rooms] = await Promise.all([
    populate_users(driver),
    populate_rooms(driver),
  ]);
  const bookings = await populate_bookings(driver, users, rooms);

  return { users, rooms, bookings };
}

async function clear_users(driver: Driver) {
  const session = driver.session();
  try {
    await session.writeTransaction((tx) =>
      tx.run(
        `MATCH (u:ROOM_User) 
         DETACH DELETE u`
      )
    );
  } catch {
    throw new InternalServerError();
  } finally {
    await session.close();
  }
}

async function clear_rooms(driver: Driver) {
  const session = driver.session();
  try {
    await session.writeTransaction((tx) =>
      tx.run(
        `MATCH (r: ROOM_Room) 
         DETACH DELETE r`
      )
    );
  } catch {
    throw new InternalServerError();
  } finally {
    await session.close();
  }
}

export async function clear_db(driver: Driver) {
  await Promise.all([clear_users(driver), clear_rooms(driver)]);
}

export async function init_driver(): Promise<Driver> {
  const url = process.env.NEO4J_URL;
  const username = process.env.NEO4J_USERNAME;
  const pwd = process.env.NEO4J_PWD;
  if (url === undefined || username === undefined || pwd === undefined) {
    throw new InternalServerError('Missing Neo4J parameters.');
  }

  const driver = neo4j.driver(url, neo4j.auth.basic(username, pwd));
  try {
    await driver.verifyConnectivity();
  } catch {
    throw new InternalServerError('It was not possible to connect to Neo4J.');
  }

  return driver;
}

export async function close_driver(driver: Driver) {
  await driver.close();
}
