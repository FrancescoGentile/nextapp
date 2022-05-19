//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { EventBroker } from '../domain/ports/event.broker';
import { UserRepository } from '../domain/ports/user.repository';
import { EventEmitterBroker } from './broker/emitter';
import { Neo4jUserRepository } from './repository/user';

export async function init_infrastructure(
  driver: Driver,
  emitter: EventEmitter
): Promise<{ user_repo: UserRepository; broker: EventBroker }> {
  const user_repo = await Neo4jUserRepository.create(driver);
  const broker = new EventEmitterBroker(emitter);

  return { user_repo, broker };
}
