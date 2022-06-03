//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { EventBroker } from '../domain/ports/event.broker';
import { ChannelRepository } from '../domain/ports/channel.repository';
import { EventEmitterBroker } from './broker/emitter';
import { Neo4jChannelRepository } from './repository/channel';
import { SubRepository } from '../domain/ports/sub.repository';
import { UserRepository } from '../domain/ports/user.repository';
import { Neo4jUserRepository } from './repository/user';
import { Neo4jSubRepository } from './repository/sub';

export async function init_infrastructure(
  driver: Driver,
  emitter: EventEmitter
): Promise<{
  user_repo: UserRepository;
  channel_repo: ChannelRepository;
  sub_repo: SubRepository;
  broker: EventBroker;
}> {
  const user_repo = await Neo4jUserRepository.create(driver);
  const channel_repo = await Neo4jChannelRepository.create(driver);
  const sub_repo = await Neo4jSubRepository.create(driver);
  const broker = new EventEmitterBroker(emitter);

  return { user_repo, channel_repo, sub_repo, broker };
}
