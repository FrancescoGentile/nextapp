//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { Credentials } from './credentials';
import { InvalidFirstName, InvalidMiddleName, InvalidSurname } from '../errors';

export class IdentityInfo {
  public constructor(
    public readonly first_name: string,
    public readonly middle_name: string | undefined,
    public readonly surname: string
  ) {
    if (first_name.trim() === '') {
      throw new InvalidFirstName();
    }
    if (middle_name !== undefined && middle_name.trim() === '') {
      throw new InvalidMiddleName();
    }
    if (surname.trim() === '') {
      throw new InvalidSurname();
    }
  }

  public get fullname(): string {
    return `${this.first_name} ${this.middle_name || ''} ${this.surname}`;
  }
}

export interface User {
  id?: UserID;
  role: UserRole;
  credentials: Credentials;
  identity: IdentityInfo;
}
