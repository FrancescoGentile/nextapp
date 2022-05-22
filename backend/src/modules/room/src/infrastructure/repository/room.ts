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

  public async get_room(room_id: RoomID): Promise<Room | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (room:ROOM_Room { id: $id })
           RETURN room`,
          { id: room_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const { id, name, details, seats, floor } =
        res.records[0].get('room').properties;

      return new Room(
        name,
        details ? JSON.parse(details) : undefined,
        seats.toInt(),
        floor.toInt(),
        RoomID.from_string(id)
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async search_rooms(
    options: SearchOptions,
    floor_number?: number
  ): Promise<Room[]> {
    const session = this.driver.session();
    try {
      let res;
      if (floor_number !== undefined) {
        res = await session.readTransaction((tx) =>
          tx.run(
            `MATCH (r:ROOM_Room { floor: $floor })
             RETURN r
             ORDER BY r.name
             SKIP $skip
             LIMIT $limit`,
            {
              skip: int(options.offset),
              limit: int(options.limit),
              floor: int(floor_number),
            }
          )
        );
      } else {
        res = await session.readTransaction((tx) =>
          tx.run(
            `MATCH (r:ROOM_Room)
             RETURN r 
             ORDER BY r.name
             SKIP $skip
             LIMIT $limit`,
            { skip: int(options.offset), limit: int(options.limit) }
          )
        );
      }

      const rooms = res.records.map((record) => {
        const { id, name, details, seats, floor } = record.get('r').properties;

        return new Room(
          name,
          details ? JSON.parse(details) : undefined,
          seats.toInt(),
          floor.toInt(),
          RoomID.from_string(id)
        );
      });

      return rooms;
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
           ORDER BY r.name
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
          room.details === undefined || room.details === null
            ? null
            : JSON.stringify(room.details);
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

  public async update_room(room: Room): Promise<boolean> {
    const session = this.driver.session();
    try {
      const details =
        room.details === undefined || room.details === null
          ? null
          : JSON.stringify(room.details);
      await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (r: ROOM_Room { id: $id })
           SET r.name = $name, r.details = $details, r.seats = $seats, r.floor = $floor`,
          {
            id: room.id!.to_string(),
            name: room.name,
            details,
            seats: int(room.seats),
            floor: int(room.floor),
          }
        )
      );
      return true;
    } catch (e) {
      const error = e as Neo4jError;
      if (error.code !== 'Neo.ClientError.Schema.ConstraintValidationFailed') {
        throw new InternalServerError();
      }
      return false;
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
