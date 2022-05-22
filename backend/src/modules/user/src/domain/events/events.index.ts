//
//
//

import { NextEvent } from '@nextapp/common/event';
import { UserID, UserRole } from '@nextapp/common/user';

export interface UserCreatedEvent extends NextEvent {
  user_id: UserID;
  role: UserRole;
}

export interface UserRoleChangedEvent extends NextEvent {
  user_id: UserID;
  role: UserRole;
}

export interface UserLoginEvent extends NextEvent {
  user_id: UserID;
}

export interface UserDeletedEvent extends NextEvent {
  user_id: UserID;
  role: UserRole;
}