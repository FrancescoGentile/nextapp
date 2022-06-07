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
} from '../../domain/events';
import { EventBroker } from '../../domain/ports/event.broker';

export class EventBrokerEmitter implements EventBroker {
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

  public on_create_booking_request(
    name: string,
    listener: (event: CreateBookingRequestEvent) => void,
    context?: any
  ): void {
    this.emitter.on(name, listener, context);
  }

  public on_delete_booking_request(
    name: string,
    listener: (event: DeleteBookingRequestEvent) => void,
    context?: any
  ): void {
    this.emitter.on(name, listener, context);
  }

  emit_create_booking_response(event: CreateBookingResponseEvent): void {
    this.emitter.emit(event.name, event);
  }

  emit_delete_booking_response(event: DeleteBookingResponseEvent): void {
    this.emitter.emit(event.name, event);
  }

  public on_send_message(
    name: string,
    listener: (event: SendMessageEvent) => void,
    context?: any
  ): void {
    this.emitter.on(name, listener, context);
  }
}
