//
//
//

import {
  CreateBookingRequestEvent,
  CreateBookingResponseEvent,
  DeleteBookingRequestEvent,
  DeleteBookingResponseEvent,
  SendMessageEvent,
  UserCreatedEvent,
  UserDeletedEvent,
  UserRoleChangedEvent,
} from '../events';

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

  on_user_role_changed(
    name: string,
    listener: (event: UserRoleChangedEvent) => void,
    context?: any
  ): void;

  on_create_booking_response(
    name: string,
    listener: (event: CreateBookingResponseEvent) => void,
    context?: any
  ): void;

  on_delete_booking_response(
    name: string,
    listener: (event: DeleteBookingResponseEvent) => void,
    context?: any
  ): void;

  emit_create_booking_request(event: CreateBookingRequestEvent): void;

  emit_delete_booking_request(event: DeleteBookingRequestEvent): void;

  emit_send_message(event: SendMessageEvent): void;
}
