//
//
//

import {
  UserCreatedEvent,
  UserRoleChangedEvent,
  UserDeletedEvent,
  SendMessageEvent,
} from '../events';

export interface EventBroker {
  emit_user_created(event: UserCreatedEvent): void;

  emit_user_deleted(event: UserDeletedEvent): void;

  emit_user_role_changed(event: UserRoleChangedEvent): void;

  emit_send_message(event: SendMessageEvent): void;
}
