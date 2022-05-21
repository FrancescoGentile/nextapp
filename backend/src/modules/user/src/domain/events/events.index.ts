//
//
//

import { NextEvent, ModuleID } from '@nextapp/common/event';
import { UserID, UserRole } from '@nextapp/common/user';
import { DateTime } from 'luxon';

export class UserCreatedEvent implements NextEvent {
  public readonly name: string = 'user-registered';

  public readonly module: ModuleID = ModuleID.USER;

  public readonly timestamp: DateTime = DateTime.utc();

  public constructor(public readonly userID: UserID, public readonly userRole: UserRole) {

  }
}