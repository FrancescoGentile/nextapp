//
//
//

import {
  UserRegisteredEvent
} from '../events/events.index';

export interface EventBroker {

  on_user_registered(listener: (event: UserRegisteredEvent) => void, 
    context?: any
    ): void;

}

