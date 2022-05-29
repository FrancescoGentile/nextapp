//
//
//

import { UserCreatedEvent } from '../events';

export interface EventBroker {
  on_user_created(
    listener: (event: UserCreatedEvent) => void,
    context?: any
  ): void;
}
