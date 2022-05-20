//
//
//

import { NextEvent, ModuleID } from '@nextapp/common/event';
import { DateTime } from 'luxon';
import { Username } from '../models/user.credentials';

export class UserRegisteredEvent implements NextEvent {
  public readonly name: string = 'user-registered';

  public readonly module: ModuleID = ModuleID.USER;

  public readonly timestamp: DateTime = DateTime.utc();

  public constructor(public readonly username: Username, public readonly email: string) {

  }
}