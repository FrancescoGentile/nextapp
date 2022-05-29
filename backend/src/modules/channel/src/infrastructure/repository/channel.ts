//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { ChannelID, Channel } from '../../domain/models/channel';
import { User } from '../../domain/models/user';
import { ChannelRepository } from '../../domain/ports/channel.repository';

export class Neo4jRoomRepository implements ChannelRepository {
  private constructor(private readonly driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jRoomRepository> {
    let session = driver.session();
    try {
      // unique constraint on ID
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT CHANNEL_unique_channel_id IF NOT EXISTS
           FOR (c:CHANNEL_Channel)
           REQUIRE c.id IS UNIQUE`
        )
      );

      await session.close();
      session = driver.session();

      // unique constraint on name
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT CHANNEL_unique_channel_name IF NOT EXISTS
           FOR (c:CHANNEL_Channel)
           REQUIRE c.name IS UNIQUE`
        )
      );

      return new Neo4jRoomRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_channel(channel_id: ChannelID): Promise<Channel | null> {
    const session = this.driver.session();
    try {
      const res_channel = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (channel:CHANNEL_Channel { id: $id })
           RETURN channel`,
          { id: channel_id.to_string() }
        )
      );

      if (res_channel.records.length === 0) {
        return null;
      }

      const { id, name, description} =
        res_channel.records[0].get('channel').properties;

      const res_presidents = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User)-[p:CHANNEL_PRESIDENT]->(c:CHANNEL_Channel { id: $id })
           RETURN u.id as uid, u.role as urole`,
          { id: channel_id.to_string() }
        )
      );

      const presidents: User[] = res_presidents.records.map((record) => ({
        id: new UserID(record.get('uid')),
        role: record.get('urole'),
      }));

      return new Channel(
        name,
        description ? JSON.parse(description) : undefined,
        presidents,
        ChannelID.from_string(id)
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }
  
}