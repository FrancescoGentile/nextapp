//
//
//

import { NextEvent } from '@nextapp/common/event';
import { UserID, UserRole } from '@nextapp/common/user';

export interface UserCreatedEvent extends NextEvent {
  id: UserID;
  role: UserRole;
  name: string;
  email: string;
  password: string;
}
