//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { EventBroker } from '../domain/ports/event.broker';
import { ChannelRepository } from '../domain/ports/channel.repository';
import { EventEmitterBroker } from './broker/emitter';
import { Neo4jChannelRepository } from './repository/channel';

export async function init_infrastructure(
  driver: Driver,
  emitter: EventEmitter
): Promise<{
  channel_repo: ChannelRepository;
  broker: EventBroker;
}> {
  const channel_repo = await Neo4jChannelRepository.create(driver);
  const broker = new EventEmitterBroker(emitter);

  return { channel_repo, broker };
}
