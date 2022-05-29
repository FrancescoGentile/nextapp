//
//
//

import EventEmitter from 'eventemitter3';
import { UserCreatedEvent } from '../../domain/events';
import { EventBroker } from '../../domain/ports/event.broker';

export class EventBrokerEmitter implements EventBroker {
  public constructor(private readonly emitter: EventEmitter) {}

  public on_user_created(
    listener: (event: UserCreatedEvent) => void,
    context?: any
  ): void {
    this.emitter.on('user_created', listener, context);
  }
}
