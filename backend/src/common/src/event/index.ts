//
//
//

import { DateTime } from 'luxon';

/**
 * Base interface for an event.
 */
export interface NextEvent {
  timestamp: DateTime;
  module: ModuleID;
  name: string;
}

/**
 * ID of the service emitting an event.
 */
export enum ModuleID {
  USER = 'user',
  ROOM = 'room',
  CLUB = 'club',
}
