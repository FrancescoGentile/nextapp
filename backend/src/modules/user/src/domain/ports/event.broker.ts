//
//
//

import {
  UserCreatedEvent,
  UserRoleChangedEvent
} from '../events/events.index';

export interface EventBroker {

  on_user_created(
    listener: (event: UserCreatedEvent) => void,
    context?: any
  ): void;

  on_user_role_changed(
    listener: (event: UserRoleChangedEvent) => void,
    context?: any
  ): void;
}

