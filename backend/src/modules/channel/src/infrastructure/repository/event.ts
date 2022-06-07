//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { Driver } from 'neo4j-driver';
import {
  DateTime as NeoDateTime,
  int,
  Integer,
  Neo4jError,
} from 'neo4j-driver-core';
import { ChannelID } from '../../domain/models/channel';
import { EventID, Event, RoomID } from '../../domain/models/event';
import { NextInterval } from '../../domain/models/interval';
import {
  Participation,
  ParticipationID,
} from '../../domain/models/participation';
import { SearchOptions } from '../../domain/models/search';
import { EventRepository } from '../../domain/ports/event.repository';

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

export class Neo4jEventRepository implements EventRepository {
  private constructor(private readonly driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jEventRepository> {
    const session = driver.session();
    try {
      // unique constraint on ID
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT CHANNEL_unique_event_id IF NOT EXISTS
           FOR (e:CHANNEL_Event)
           REQUIRE e.id IS UNIQUE`
        )
      );

      return new Neo4jEventRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_event(event_id: EventID): Promise<Event | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (e:CHANNEL_Event { id: $id })--(c:CHANNEL_Channel)
           RETURN e, c.id AS id`,
          { id: event_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const record = res.records[0];
      const { name, description, start, end, room, seats, booking } =
        record.get('e').properties;

      return new Event(
        ChannelID.from_string(record.get('id')),
        name,
        description,
        neo4j_to_interval(start, end),
        new RoomID(room),
        seats.toNumber(),
        booking,
        event_id
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_channel_events(
    channel: ChannelID,
    options: SearchOptions,
    past: boolean
  ): Promise<Event[]> {
    const session = this.driver.session();
    try {
      let res;
      if (past) {
        res = await session.readTransaction((tx) =>
          tx.run(
            `MATCH (e:CHANNEL_Event)--(c:CHANNEL_Channel { id: $id })
             WHERE e.end <= $end
             RETURN e
             ORDER BY e.start DESC
             SKIP $skip
             LIMIT $limit`,
            {
              id: channel.to_string(),
              end: luxon_to_neo4j(DateTime.utc()),
              skip: int(options.offset),
              limit: int(options.limit),
            }
          )
        );
      } else {
        res = await session.readTransaction((tx) =>
          tx.run(
            `MATCH (e:CHANNEL_Event)--(c:CHANNEL_Channel { id: $id })
             WHERE e.start >= $start
             RETURN e
             ORDER BY e.start
             SKIP $skip
             LIMIT $limit`,
            {
              id: channel.to_string(),
              start: luxon_to_neo4j(DateTime.utc()),
              skip: int(options.offset),
              limit: int(options.limit),
            }
          )
        );
      }

      const events = res.records.map((record) => {
        const { id, name, description, start, end, room, seats, booking } =
          record.get('e').properties;

        return new Event(
          channel,
          name,
          description,
          neo4j_to_interval(start, end),
          new RoomID(room),
          seats.toNumber(),
          booking,
          EventID.from_string(id)
        );
      });

      return events;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async update_event(event: Event): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (e:CHANNEL_Event { id: $id })
           SET e.name = $name, e.description = $description`,
          { id: event.id!.to_string() }
        )
      );

      return res.summary.counters.updates().nodesDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async create_event(event: Event): Promise<EventID> {
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = EventID.generate();

        try {
          // eslint-disable-next-line no-await-in-loop
          await session.writeTransaction((tx) =>
            tx.run(
              `MATCH (c:CHANNEL_Channel { id: $c_id })
               CREATE (c)-[:CHANNEL_EVENTS]-(e:CHANNEL_Event { 
                 id: $id, 
                 name: $name, 
                 description: $description,
                 start: $start, 
                 end: $end, 
                 room: $room,
                 seats: $seats,
                 booking: $booking })`,
              {
                c_id: event.channel.to_string(),
                name: event.name,
                description: event.description,
                start: luxon_to_neo4j(event.interval.start),
                end: luxon_to_neo4j(event.interval.end),
                room: event.room.to_string(),
                seats: int(event.seats),
                booking: event.booking,
              }
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

  public async remove_event(event: EventID): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (e:CHANNEL_Event { id: $id })
           DETACH DELETE e`,
          { id: event.to_string() }
        )
      );

      return res.summary.counters.updates().nodesDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  // --------------------------------------------------------

  public async get_participants_count(
    event_id: EventID
  ): Promise<number | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User)-[:CHANNEL_PARTICIPATE]->(e:CHANNEL_Event { id: $id })
           RETURN COUNT(u) AS count`,
          {
            id: event_id.to_string(),
          }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      return res.records[0].get('count').toNumber();
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_participants(
    event_id: EventID,
    options: SearchOptions
  ): Promise<UserID[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User)-[:CHANNEL_PARTICIPATE]->(e:CHANNEL_Event { id: $id })
           RETURN u.id AS uid
           ORDER BY u.id
           SKIP $skip
           LIMIT $limit`,
          {
            id: event_id.to_string(),
            skip: int(options.offset),
            limit: int(options.limit),
          }
        )
      );

      const users = res.records.map((record) => new UserID(record.get('uid')));
      return users;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_user_participation(
    user_id: UserID,
    participation_id: ParticipationID
  ): Promise<Participation | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User { id: $uid })-[p:CHANNEL_PARTICIPATE { id: $pid }]->(e:CHANNEL_Event)
           RETURN e.id AS eid`,
          { uid: user_id.to_string(), pid: participation_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      return {
        id: participation_id,
        user_id,
        event_id: EventID.from_string(res.records[0].get('eid')),
      };
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_user_participations(
    user_id: UserID,
    options: SearchOptions,
    past: boolean
  ): Promise<Participation[]> {
    const session = this.driver.session();
    try {
      let res;
      if (past) {
        res = await session.readTransaction((tx) =>
          tx.run(
            `MATCH (u:CHANNEL_User)-[p:CHANNEL_Participate]->(e:CHANNEL_Event)
             WHERE u.id = $id AND e.end <= $end
             RETURN e.id AS eid, p.id AS pid
             ORDER BY e.start DESC
             SKIP $skip
             LIMIT $limit`,
            {
              id: user_id.to_string(),
              end: luxon_to_neo4j(DateTime.utc()),
              skip: int(options.offset),
              limit: int(options.limit),
            }
          )
        );
      } else {
        res = await session.readTransaction((tx) =>
          tx.run(
            `MATCH (u:CHANNEL_User)-[p:CHANNEL_Participate]->(e:CHANNEL_Event)
             WHERE u.id = $id AND e.start >= $start
             RETURN e.id AS eid, p.id AS pid
             ORDER BY e.start
             SKIP $skip
             LIMIT $limit`,
            {
              id: user_id.to_string(),
              start: luxon_to_neo4j(DateTime.utc()),
              skip: int(options.offset),
              limit: int(options.limit),
            }
          )
        );
      }

      const participations = res.records.map((record) => ({
        id: ParticipationID.from_string(record.get('pid')),
        user_id,
        event_id: EventID.from_string(record.get('cid')),
      }));

      return participations;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async add_participation(
    participation: Participation
  ): Promise<ParticipationID> {
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = ParticipationID.generate();

        // eslint-disable-next-line no-await-in-loop
        const p = await this.get_user_participation(participation.user_id, id);
        if (p === null) {
          // eslint-disable-next-line no-await-in-loop
          await session.writeTransaction((tx) =>
            tx.run(
              `MATCH (u:CHANNEL_User { id: $uid }), (e:CHANNEL_Event { id: $eid })
               CREATE (u)-[p:CHANNEL_PARTICIPATE { id: $pid }]->(e)`,
              {
                uid: participation.user_id.to_string(),
                eid: participation.event_id.to_string(),
                pid: id.to_string(),
              }
            )
          );

          return id;
        }
      }
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async delete_participation(
    user_id: UserID,
    participation_id: ParticipationID
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User { id: $uid })-[p:CHANNEL_PARTICIPATE { id: $pid }]->(:CHANNEL_Event)
           DELETE p`,
          { uid: user_id.to_string(), pid: participation_id.to_string() }
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
