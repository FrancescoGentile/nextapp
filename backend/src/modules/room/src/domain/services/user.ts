//
//
//

import {
  UserCreatedEvent,
  UserDeletedEvent,
  UserRoleChangedEvent,
} from '../events';
import { User } from '../models/user';
import { EventBroker } from '../ports/event.broker';
import { UserRepository } from '../ports/user.repository';

// This is an internal service used to process the events regarding users.
export class NextUserService {
  public constructor(
    private readonly broker: EventBroker,
    private readonly repo: UserRepository
  ) {
    this.broker.on_user_created('user_created', this.create_user, this);
    this.broker.on_user_deleted('user_deleted', this.delete_user, this);
    this.broker.on_user_role_changed(
      'user_role_changed',
      this.change_user_role,
      this
    );
  }

  private async create_user(event: UserCreatedEvent) {
    const user: User = { id: event.user_id, role: event.role };
    try {
      await this.repo.create_user(user);
    } catch {
      // TODO: log error
    }
  }

  private async delete_user(event: UserDeletedEvent) {
    try {
      await this.repo.delete_user(event.user_id);
    } catch {
      // TODO: log error
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async change_user_role(event: UserRoleChangedEvent) {
    try {
      const done = await this.repo.set_user_role(event.user_id, event.role);
      // If the user is not in the repo, it means that the previous UserCreatedEvent
      // has not been processed. Thus, we create the user now with the new role
      // (when that event will be processed, it will fail).
      if (!done) {
        const user: User = { id: event.user_id, role: event.role };
        await this.repo.create_user(user);
      }
    } catch {
      // TODO: log error
    }
  }
}
