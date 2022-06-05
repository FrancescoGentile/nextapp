//
//
//

import { UserID } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { ChannelID, Channel } from '../../domain/models/channel';
import { ChannelRepository } from '../../domain/ports/channel.repository';
import { SearchOptions } from '../../domain/models/search';
import { Sub, SubID } from '../../domain/models/sub';

export class Neo4jChannelRepository implements ChannelRepository {
  private constructor(private readonly driver: Driver) {}

  public async get_channel_by_name(channel_name: string): Promise<Channel | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User)-[p:CHANNEL_PRESIDENT]-(c:CHANNEL_Channel)
           WHERE c.name = name
           RETURN u, c`,
          { name: channel_name }
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
        description,
        presidents,
        ChannelID.from_string(id)
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async update_channel(channel: Channel): Promise<boolean> {
    const session = this.driver.session();
    try {
      const description =
        channel.description === undefined || channel.description === null
          ? null
          : JSON.stringify(channel.description);
      await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (c: CHANNEL_Channel { id: $id })
           SET c.name = $name, c.description = $description`,
          {
            id: channel.id!.to_string(),
            name: channel.name,
            description
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
    const channel_id_stringa = channel_id.to_string();
    console.log(channel_id_stringa);
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User)-[p:CHANNEL_PRESIDENT]-(c:CHANNEL_Channel { id: $id })
           RETURN u, c`,
          { id: channel_id_stringa }
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
    } catch(e) {
      console.log(e);
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async create_channel(channel: Channel): Promise<ChannelID | undefined> {
    let session = this.driver.session();
    try {
      while (true) {
        const id = ChannelID.generate();
        const name = channel.name;
        const description =
          channel.description === undefined || channel.description === null
            ? null
            : JSON.stringify(channel.description);
        try {
          await session.writeTransaction((tx) =>
            tx.run(
              `CREATE (c:CHANNEL_Channel {
               id: $id, 
               name: $name,
               description: $description
            })`,
              { id: id.to_string(), name: name, description: description }
            )
          );
          
          await session.close();
          session = this.driver.session();

          for (
              const pres of channel.presID_array
            ) {
            await session.writeTransaction((tx) =>
              tx.run(
                `MATCH (u:CHANNEL_User), (c:CHANNEL_Channel)
                WHERE u.id = $user_id AND c.id = $channel_id
                CREATE (u)-[p:CHANNEL_PRESIDENT]->(c)`,
                { 
                  user_id: pres.to_string(),
                  channel_id: id.to_string()
                }
              )
            );
          }

          return id;
        } catch (e) {
          //console.log(e);
          const error = e as Neo4jError;
          if (
            error.code !== 'Neo.ClientError.Schema.ConstraintValidationFailed'
          ) {
            throw e;
          }
          // there is already a channel with the same name
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

      const update = res.summary.counters.updates();
      return update.nodesDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_pres_channels(requester: UserID, options: SearchOptions): Promise<Channel[]> {
    let session = this.driver.session();
    try {
      const res_chan = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User{id: $id})-[p:CHANNEL_PRESIDENT]-(c:CHANNEL_Channel)
           RETURN c, u
           ORDER BY c.id
           SKIP $skip
           LIMIT $limit`,
          { 
            id: requester,
            skip: int(options.offset), 
            limit: int(options.limit) 
          }
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

  public async is_president(user_id: UserID, channel_id: ChannelID): Promise<boolean | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User { id: $id })-[p:CHANNEL_PRESIDENT]-(c:CHANNEL_Channel{ cid: $cid }))
           RETURN u.id as pres_id`,
          { id: user_id.to_string(), cid: channel_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return false;
      } else {
        return true;
      }
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

}