//
//
//

import { NextEvent } from '@nextapp/common/event';
import { UserID, UserRole } from '@nextapp/common/user';

export interface UserCreatedEvent extends NextEvent {
  user_id: UserID;
  role: UserRole;
  fullname: string;
  username: string;
  email: string;
  password: string;
}

export interface UserRoleChangedEvent extends NextEvent {
  user_id: UserID;
  role: UserRole;
}

export interface UserDeletedEvent extends NextEvent {
  user_id: UserID;
}

export interface SendMessageEvent extends NextEvent {
  users: UserID[];
  type: string;
  title: string;
  body: string;
  html?: string;
}
