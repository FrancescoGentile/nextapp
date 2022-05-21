//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { RoomID, Room } from '../../domain/models/room';
import { SearchOptions } from '../../domain/models/search';
import { RoomRepository } from '../../domain/ports/room.repository';

export class Neo4jRoomRepository implements RoomRepository {
  private constructor(private readonly driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jRoomRepository> {
    let session = driver.session();
    try {
      // unique constraint on ID
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT ROOM_unique_room_id IF NOT EXISTS
           FOR (r:ROOM_Room)
           REQUIRE r.id IS UNIQUE`
        )
      );

      await session.close();
      session = driver.session();

      // unique constraint on name
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT ROOM_unique_room_name IF NOT EXISTS
           FOR (r:ROOM_Room)
           REQUIRE r.name IS UNIQUE`
        )
      );

      await session.close();
      session = driver.session();
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE INDEX ROOM_floor_index IF NOT EXISTS 
           FOR (r:ROOM_Room) 
           ON (r.floor)`
        )
      );

      return new Neo4jRoomRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_rooms(room_ids: RoomID[]): Promise<Room[]> {
    const session = this.driver.session();
    try {
      const ids = room_ids.map((id) => id.to_string());
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (room:ROOM_Room)
           WHERE room.id IN $ids
           RETURN room`,
          { ids }
        )
      );

      const rooms: Room[] = [];
      res.records.forEach((record) => {
        const { id, name, details, seats, floor } =
          record.get('room').properties;
        rooms.push(
          new Room(
            name,
            details ? JSON.parse(details) : undefined,
            seats.toInt(),
            floor.toInt(),
            RoomID.from_string(id)
          )
        );
      });

      return rooms;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async search_rooms(options: SearchOptions): Promise<RoomID[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (r:ROOM_Room)
           RETURN r.id as id
           ORDER BY r.id
           SKIP $skip
           LIMIT $limit`,
          { skip: int(options.offset), limit: int(options.limit) }
        )
      );

      const ids = res.records.map((record) =>
        RoomID.from_string(record.get('id'))
      );
      return ids;
    } catch (e) {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async search_rooms_by_floor(
    floor: number,
    options: SearchOptions
  ): Promise<RoomID[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (r:ROOM_Room { floor: $floor })
           RETURN r.id as id
           ORDER BY r.id
           SKIP $skip
           LIMIT $limit`,
          {
            floor: int(floor),
            skip: int(options.offset),
            limit: int(options.limit),
          }
        )
      );

      const ids = res.records.map((record) =>
        RoomID.from_string(record.get('id'))
      );
      return ids;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async create_room(room: Room): Promise<RoomID | undefined> {
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = RoomID.generate();
        const { name } = room;
        const details =
          room.details === undefined ? null : JSON.stringify(room.details);
        const seats = int(room.seats);
        const floor = int(room.floor);

        try {
          // eslint-disable-next-line no-await-in-loop
          await session.writeTransaction((tx) =>
            tx.run(
              `CREATE (r:ROOM_Room {
               id: $id, 
               name: $name,
               details: $details,
               seats: $seats,
               floor: $floor
            })`,
              { id: id.to_string(), name, details, seats, floor }
            )
          );
          return id;
        } catch (e) {
          const error = e as Neo4jError;
          if (
            error.code !== 'Neo.ClientError.Schema.ConstraintValidationFailed'
          ) {
            throw e;
          }
          // there is already a room with the same name
          if (error.message.includes(name)) {
            return undefined;
          }
        }
      }
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async delete_room(room_id: RoomID): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (r:ROOM_Room {id: $id})
           DETACH DELETE r`,
          { id: room_id.to_string() }
        )
      );
      const update = res.summary.counters.updates();
      return update.nodesDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }
}
