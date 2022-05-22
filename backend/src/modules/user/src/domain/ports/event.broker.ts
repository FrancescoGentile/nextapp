//
//
//

import {
  UserCreatedEvent,
  UserRoleChangedEvent,
  UserLoginEvent,
  UserDeletedEvent
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

  on_user_login(
    listener: (event: UserLoginEvent) => void,
    context?: any
  ): void;

  on_user_deleted(
    listener: (event: UserDeletedEvent) => void,
    context?: any
  ): void;

}