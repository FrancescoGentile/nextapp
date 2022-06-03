//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { ChannelID, Channel } from '../../domain/models/channel';
import { ChannelRepository } from '../../domain/ports/channel.repository';
import { SearchOptions } from '../../domain/models/search';
import { Sub, SubID } from '../../domain/models/sub';

export class Neo4jChannelRepository implements ChannelRepository {
  private constructor(private readonly driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jChannelRepository> {
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

      return new Neo4jChannelRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_channel(channel_id: ChannelID): Promise<Channel | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User)-[p:CHANNEL_PRESIDENT]-(c:CHANNEL_Channel { id: $id })
           RETURN u, c`,
          { id: channel_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const { id, name, description } =
        res.records[0].get('c').properties;

      const presidents: string[] = res.records.map((record) => {
          const id = record.get('u').properties;
          return id
      });

      return new Channel(
        name,
        description, // since description is a string you do not need to stringify and parse it
        presidents,
        ChannelID.from_string(id)
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async create_channel(channel: Channel): Promise<ChannelID | undefined> {
    let session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = ChannelID.generate();
        const { name } = channel;
        const description =
          channel.description === undefined || channel.description === null
            ? null
            : JSON.stringify(channel.description);
        try {
          // eslint-disable-next-line no-await-in-loop
          await session.writeTransaction((tx) =>
            tx.run(
              `CREATE (c:CHANNEL_Channel {
               id: $id, 
               name: $name,
               description: $description,
            })`,
              { id: id.to_string(), name, description }
            )
          );
          
          await session.close();
          session = this.driver.session();

          for (
              let i = 0; 
              i < Channel.MAX_PRESIDENTS;
              i++
            ) {
            await session.writeTransaction((tx) =>
              tx.run(
                `MATCH (u:CHANNEL_User), (r:CHANNEL_Channel)
                WHERE u.id = $user_id AND c.id = $channel_id
                CREATE (u)-[p:CHANNEL_PRESIDENT]->(c)`,
                { 
                  user_id: channel.presID_array[i],
                  channel_id: channel.id!.to_string()
                }
              )
            );
          }

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

  public async get_channel_list(options: SearchOptions): Promise<Channel[]> {
    let session = this.driver.session();
    try {
      const res_chan = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (c:CHANNEL_Channel)-[p:CHANNEL_PRESIDENT]-(u:CHANNEL_User)
           RETURN c, u
           ORDER BY c.id
           SKIP $skip
           LIMIT $limit`,
          { skip: int(options.offset), limit: int(options.limit) }
        )
      );

      const channels: Channel[] = res_chan.records.map((record) => {
        const info = record.get('c').properties;
        const channel_id = ChannelID.from_string(info.id);
        const presidents: string[] = res_chan.records.map((record) => {
          const id = record.get('u').properties;
          return id
      });
        return new Channel(
          info.name,
          info.description,
          presidents,
          channel_id
        )
      });

      return channels;
    } catch (e) {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async delete_channel(channel_id: ChannelID): Promise<boolean>{
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (c:CHANNEL_Channel {id: $channel_id})
           DETACH DELETE c`,
          { channel_id: channel_id.to_string() }
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