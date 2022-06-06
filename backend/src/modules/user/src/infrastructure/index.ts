//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import { EventBroker } from '../domain/ports/event.broker';
import { FileStorage } from '../domain/ports/file.storage';
import { UserRepository } from '../domain/ports/user.repository';
import { EventEmitterBroker } from './broker/emitter';
import { Neo4jUserRepository } from './repository/user';
import { GoogleCloudStorage } from './storage/gcp';

export async function init_infrastructure(
  driver: Driver,
  emitter: EventEmitter
): Promise<{
  repository: UserRepository;
  storage: FileStorage;
  broker: EventBroker;
}> {
  const repository = await Neo4jUserRepository.create(driver);
  const storage = new GoogleCloudStorage();
  const broker = new EventEmitterBroker(emitter);

  return { repository, storage, broker };
}
