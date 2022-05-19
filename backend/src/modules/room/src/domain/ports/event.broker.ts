//
//
//

import {
  UserCreatedEvent,
  UserDeletedEvent,
  UserRoleChangedEvent,
} from '../events';

export interface EventBroker {
  on_user_created(
    listener: (event: UserCreatedEvent) => void,
    context?: any
  ): void;

  on_user_deleted(
    listener: (event: UserDeletedEvent) => void,
    context?: any
  ): void;

  on_user_role_changed(
    listener: (event: UserRoleChangedEvent) => void,
    context?: any
  ): void;
}
