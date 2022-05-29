//
//
//

import EventEmitter from 'eventemitter3';
import {
  
} from '../../domain/events';
import { EventBroker } from '../../domain/ports/event.broker';

export class EventEmitterBroker implements EventBroker {
  public constructor(private readonly emitter: EventEmitter) {}



}
