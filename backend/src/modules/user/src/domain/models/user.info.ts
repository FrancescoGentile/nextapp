//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';

export interface UserInfo {
  id?: UserID,
  role: Role,
  timestamp: DateTime,
  identity: IdentityInfo
}
  
  
export enum Role {
  USER,
  SYS_ADMIN,
}

export interface IdentityInfo {
  first_name: string,
  middle_name?: string,
  surname: string
}