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

  public emit_user_created(event: UserCreatedEvent): void {
    this.emitter.emit(event.name, event);
  }

  public emit_user_deleted(event: UserDeletedEvent): void {
    this.emitter.emit(event.name, event);
  }

  public emit_user_role_changed(event: UserRoleChangedEvent): void {
    this.emitter.emit(event.name, event);
  }
}
