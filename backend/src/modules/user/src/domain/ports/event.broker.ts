//
//
//

import {
  UserCreatedEvent
} from '../events/events.index';

export interface EventBroker {

  on_user_registered(listener: (event: UserCreatedEvent) => void, 
    context?: any
    ): void;

}

