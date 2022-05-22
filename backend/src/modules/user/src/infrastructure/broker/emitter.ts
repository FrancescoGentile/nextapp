//
//
//

import EventEmitter from 'eventemitter3';
import {
  UserCreatedEvent, 
  UserDeletedEvent, 
  UserLoginEvent, 
  UserRoleChangedEvent
} from '../../domain/events/events.index';
import { EventBroker } from '../../domain/ports/event.broker';

export class EventEmitterBroker implements EventBroker {
  public constructor(private readonly emitter: EventEmitter) {}
  
  on_user_created(listener: (
    event: UserCreatedEvent) => void, 
    context?: any
  ): void {
    this.emitter.on('user_registered', listener, context)
  }
  on_user_role_changed(listener: (
    event: UserRoleChangedEvent) => void, 
    context?: any
  ): void {
    this.emitter.on('user_role_changed', listener, context)
  }
  
  on_user_login(listener: (
    event: UserLoginEvent) => void, 
    context?: any
  ): void {
    this.emitter.on('user_logged_in', listener, context)
  }
  
  on_user_deleted(listener: (
    event: UserDeletedEvent) => void, 
    context?: any
  ): void {
    this.emitter.on('user_logged_in', listener, context)
  }
}