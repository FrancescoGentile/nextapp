//
//
//

import { UserCreatedEvent, UserDeletedEvent } from '../events';

export interface EventBroker {
  on_user_created(
    name: string,
    listener: (event: UserCreatedEvent) => void,
    context?: any
  ): void;

  on_user_deleted(
    name: string,
    listener: (event: UserDeletedEvent) => void,
    context?: any
  ): void;
}
