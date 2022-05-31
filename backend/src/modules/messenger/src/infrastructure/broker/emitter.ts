//
//
//

import EventEmitter from 'eventemitter3';
import {
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

  public on_send_message(
    name: string,
    listener: (event: SendMessageEvent) => void,
    context?: any
  ): void {
    this.emitter.on(name, listener, context);
  }
}
