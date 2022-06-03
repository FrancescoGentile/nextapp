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
  
  public static asyncget_user_subscriptions(options: SearchOptions): Promise<Channel[] | null> {
    
  }

  public async create_sub(sub: Sub): Promise<SubID | undefined> {
    const session = this.driver.session();
    try {
      const sub_id = SubID.generate();
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User), (r:CHANNEL_Channel)
            WHERE u.id = $user_id AND c.id = $channel_id
            CREATE (u)-[b:ROOM_BOOKING { id: $sub_id }]-(c)`,
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
        
}