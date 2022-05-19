//
//
//

import { EventBroker } from '../ports/event.broker';
import { UserRepository } from '../ports/user.repository';
import { NextUserService } from './user';

export function init_services(user_repo: UserRepository, broker: EventBroker) {
  const _ = new NextUserService(broker, user_repo);
}
