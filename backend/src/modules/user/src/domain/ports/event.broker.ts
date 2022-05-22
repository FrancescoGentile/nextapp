//
//
//

import {
  UserCreatedEvent,
  UserRoleChangedEvent,
  UserLogin
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
    listener: (event: UserLogin) => void,
    context?: any
  ): void;
}
