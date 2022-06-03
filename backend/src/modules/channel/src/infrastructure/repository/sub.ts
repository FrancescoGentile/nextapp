//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { ChannelID, Channel } from '../../domain/models/channel';
import { SubRepository } from '../../domain/ports/sub.repository';
import { SearchOptions } from '../../domain/models/search';
import { Sub, SubID } from '../../domain/models/sub';


export class Neo4jSubRepository implements SubRepository {
    private constructor(private readonly driver: Driver) {}
    
  public static async create(driver: Driver): Promise<Neo4jSubRepository> {
    return new Neo4jSubRepository(driver);
  }

  public async create_sub(sub: Sub): Promise<SubID | undefined> {
    const session = this.driver.session();
    try {
      const sub_id = SubID.generate();
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User), (r:CHANNEL_Channel)
            WHERE u.id = $user_id AND c.id = $channel_id
            CREATE (u)-[s:CHANNEL_SUB { id: $sub_id }]-(c)`,
          {
            user_id: sub.user.to_string(),
            channel_id: sub.channel.to_string(),
            sub_id: sub_id.to_string()
          }
        )
      );
      
      return res.summary.counters.updates().relationshipsCreated > 0
        ? sub_id
        : undefined;
    } catch {
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

}