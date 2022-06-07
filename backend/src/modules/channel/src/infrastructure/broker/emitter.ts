//
//
//

import EventEmitter from 'eventemitter3';
import {
  CreateBookingRequestEvent,
  CreateBookingResponseEvent,
  DeleteBookingRequestEvent,
  DeleteBookingResponseEvent,
  SendMessageEvent,
  UserCreatedEvent,
  UserDeletedEvent,
  UserRoleChangedEvent,
} from '../../domain/events';
import { EventBroker } from '../../domain/ports/event.broker';

export class EventEmitterBroker implements EventBroker {
  public constructor(private readonly emitter: EventEmitter) {}

  public on_user_created(
    name: string,
    listener: (event: UserCreatedEvent) => void,
    context?: any
  ): void {
    this.emitter.on(name, listener, context);
  }

  public on_user_deleted(
    name: string,
    listener: (event: UserDeletedEvent) => void,
    context?: any
  ): void {
    this.emitter.on(name, listener, context);
  }

  public on_user_role_changed(
    name: string,
    listener: (event: UserRoleChangedEvent) => void,
    context?: any
  ): void {
    this.emitter.on(name, listener, context);
  }

  public on_create_booking_response(
    name: string,
    listener: (event: CreateBookingResponseEvent) => void,
    context?: any
  ): void {
    this.emitter.on(name, listener, context);
  }

  on_delete_booking_response(
    name: string,
    listener: (event: DeleteBookingResponseEvent) => void,
    context?: any
  ): void {
    this.emitter.on(name, listener, context);
  }

  public emit_create_booking_request(event: CreateBookingRequestEvent): void {
    this.emitter.emit(event.name, event);
  }

  public emit_delete_booking_request(event: DeleteBookingRequestEvent): void {
    this.emitter.emit(event.name, event);
  }

  public emit_send_message(event: SendMessageEvent): void {
    this.emitter.emit(event.name, event);
  }
}
