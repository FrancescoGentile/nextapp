//
//
//

import { Event } from '../models/event';

export interface EventCache {
  /**
   * saves an event and returns a key associated to it.
   * @param event
   */
  save_event(event: Event): string;

  /**
   * Returns the event with the given key if it exists.
   * @param key
   */
  get_event(key: string): Event | null;

  /**
   * Deletes the event with the given key.
   * @param key
   */
  delete_event(key: string): void;
}
