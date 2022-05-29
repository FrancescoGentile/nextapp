//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { ChannelID, Channel } from '../../domain/models/channel';
import { ChannelRepository } from '../../domain/ports/channel.repository';

export class Neo4jRoomRepository implements ChannelRepository {
  private constructor(private readonly driver: Driver) {}
  
  get_channel(id: ChannelID): Promise<Channel | null> {
    throw new Error('Method not implemented.');
  }
  
}
