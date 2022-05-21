//
//
//

import {
  UserCreatedEvent,
  UserRoleChangedEvent
} from '../events/events.index';

export interface EventBroker {

  on_user_registered(listener: (event: UserCreatedEvent) => void, 
    context?: any
    ): void;

  on_admin_downgraded(listener: (event: UserRoleChangedEvent) => void,
    context?: any
    ): void;

}

