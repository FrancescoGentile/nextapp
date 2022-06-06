//
//
//

import { UserID } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { Channel, ChannelID } from '../../domain/models/channel';
import { SubRepository } from '../../domain/ports/sub.repository';
import { SearchOptions } from '../../domain/models/search';
import { Sub, SubID } from '../../domain/models/sub';


export class Neo4jSubRepository implements SubRepository {
    private constructor(private readonly driver: Driver) {}

  public async is_sub(user: UserID, channel: ChannelID): Promise<boolean>{
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User{id: $user_id})-[s:CHANNEL_SUB]->(c:CHANNEL_Channel{id: $channel_id})
            RETURN s.id as sid`,
          {
            user_id: user.to_string(),
            channel_id: channel.to_string(),
          }
        )
      );
      
      return res.records.length > 0;
    } catch(e) {
      console.log(e);
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public static async create(driver: Driver): Promise<Neo4jSubRepository> {
    return new Neo4jSubRepository(driver);
  }

  public async create_sub(sub: Sub): Promise<SubID | undefined> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User), (c:CHANNEL_Channel)
            WHERE u.id = $user_id AND c.id = $channel_id
            CREATE (u)-[s:CHANNEL_SUB { id: $sub_id }]->(c)`,
          {
            user_id: sub.user.to_string(),
            channel_id: sub.channel.to_string(),
            sub_id: sub.id!.to_string()
          }
        )
      );
      
      return res.summary.counters.updates().relationshipsCreated > 0
        ? sub.id!
        : undefined;
    } catch(e) {
      //console.log(e);
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_user_subscriptions(user_id : UserID, options: SearchOptions): Promise<Sub[] | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (user:CHANNEL_User{id: $id})-[s:CHANNEL_SUB]-(chan:CHANNEL_Channel)
           RETURN chan.id as cid, s.id as sid
           ORDER BY chan.id
           SKIP $skip
           LIMIT $limit`,
          { 
            id: user_id.to_string(),
            skip: int(options.offset),
            limit: int(options.limit) 
          }
        )
      );

      const subs: Sub[] = res.records.map((record) => ({
        id: SubID.from_string(record.get('sid')),
        channel: ChannelID.from_string(record.get('cid')),
        user: user_id
      }));

      return subs;
    } catch (e) {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_subscription_info(sub_id : SubID): Promise<Sub | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (user:CHANNEL_User)-[s:CHANNEL_SUB]-(chan:CHANNEL_Channel)
           WHERE s.id = $sub_id
           RETURN u.id as uid, chan.id as cid, s.id as sub_id`,
          { sub_id: sub_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const record = res.records[0];
      return {
        id: SubID.from_string(record.get('sub_id')),
        channel: ChannelID.from_string(record.get('cid')),
        user: new UserID(record.get('uid'))
      };
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async delete_subscriber(user_id: UserID, sub_id: SubID): Promise<boolean>{
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (user:CHANNEL_User)-[s:CHANNEL_SUB]-(chan:CHANNEL_Channel)
           WHERE s.id = $sub_id
           DELETE s`,
          { user_id: user_id.to_string(), sub_id: sub_id.to_string() }
        )
      );

      return res.summary.counters.updates().relationshipsDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }
  
  public async get_club_subscribers(channel_id: ChannelID): Promise<Sub[]> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (user:CHANNEL_User)-[s:CHANNEL_SUB]-(chan:CHANNEL_Channel {id: $id})
           RETURN s.id as sid, user.id as uid, chan.id as cid
           ORDER BY s.id`,
          { id: channel_id.to_string() }
        )
      );

      const subs: Sub[] = res.records.map((record) => {
        const id = SubID.from_string(record.get('sid'));
        const channel = ChannelID.from_string(record.get('cid'));
        const user = new UserID(record.get('uid'));
        return {
          id,
          channel,
          user
        }
      })

      return subs;
    } catch(e) {
      console.log(e);
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

}