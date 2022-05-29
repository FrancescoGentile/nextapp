//
//
//

import EventEmitter from 'eventemitter3';
import {
  UserCreatedEvent,
  UserDeletedEvent,
  UserRoleChangedEvent,
} from '../../domain/events';
import { EventBroker } from '../../domain/ports/event.broker';

export class EventEmitterBroker implements EventBroker {
  public constructor(private readonly emitter: EventEmitter) {}

  public on_user_created(
    listener: (event: UserCreatedEvent) => void,
    context?: any
  ): void {
    this.emitter.on('user_created', listener, context);
  }

  public on_user_deleted(
    listener: (event: UserDeletedEvent) => void,
    context?: any
  ): void {
    this.emitter.on('user_deleted', listener, context);
  }

  public on_user_role_changed(
    listener: (event: UserRoleChangedEvent) => void,
    context?: any
  ): void {
    this.emitter.on('user_role_changed', listener, context);
  }
}
