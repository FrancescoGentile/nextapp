//
//
//

import {
  CreateBookingRequestEvent,
  CreateBookingResponseEvent,
  DeleteBookingRequestEvent,
  DeleteBookingResponseEvent,
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

  on_create_booking_request(
    name: string,
    listener: (event: CreateBookingRequestEvent) => void,
    context?: any
  ): void;

  on_delete_booking_request(
    name: string,
    listener: (event: DeleteBookingRequestEvent) => void,
    context?: any
  ): void;

  emit_create_booking_response(event: CreateBookingResponseEvent): void;

  emit_delete_booking_response(event: DeleteBookingResponseEvent): void;
}
