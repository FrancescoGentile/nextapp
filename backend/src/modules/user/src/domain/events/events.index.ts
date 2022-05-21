//
//
//

import { NextEvent, ModuleID } from '@nextapp/common/event';
import { UserID, UserRole } from '@nextapp/common/user';
import { DateTime } from 'luxon';

export interface UserCreatedEvent extends NextEvent {
  user_id: UserID;
  role: UserRole;
}

export interface UserRoleChangedEvent extends NextEvent {
  user_id: UserID;
  role: UserRole;
}