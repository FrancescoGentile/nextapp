//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { RoomID, Room } from '../../domain/models/room';
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
          new Room(name, details, seats.toNumber(), floor, new RoomID(id))
        );
      });

      return rooms;
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
        const { name, details } = room;
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
