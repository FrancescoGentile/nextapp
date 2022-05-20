//
//
//

import EventEmitter from 'eventemitter3';
import {
  UserRegisteredEvent
} from '../../domain/events/events.index';
import { EventBroker } from '../../domain/ports/event.broker';

export class EventEmitterBroker implements EventBroker {
  public constructor(private readonly emitter: EventEmitter) {}

  on_user_registered(listener: (
    event: UserRegisteredEvent) => void, 
    context?: any
  ): void {
    this.emitter.on('user_registered', listener, context)
  }

}