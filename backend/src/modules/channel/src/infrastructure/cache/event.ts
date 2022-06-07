//
//
//

import { Duration } from 'luxon';
import { nanoid } from 'nanoid';
import NodeCache from 'node-cache';
import { Event } from '../../domain/models/event';
import { EventCache } from '../../domain/ports/event.cache';

export class InMemoryEventCache implements EventCache {
  private readonly cache;

  public constructor() {
    this.cache = new NodeCache({
      stdTTL: Duration.fromObject({ hours: 24 }).seconds,
      useClones: false,
    });
  }

  public save_event(event: Event): string {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const key = nanoid();
      if (!this.cache.has(key)) {
        this.cache.set(key, event);
        return key;
      }
    }
  }

  public get_event(key: string): Event | null {
    const event = this.cache.get<Event>(key);
    return event || null;
  }

  public delete_event(key: string): void {
    this.cache.del(key);
  }
}
