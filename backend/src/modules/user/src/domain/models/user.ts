//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { Username, Password } from './user.credentials';
import { Email } from './email';
import { InvalidFirstName, InvalidSurname } from '../errors';

export class User {
  public id?: UserID;

  public readonly role: UserRole;

  public readonly first_name: string;

  public readonly middle_name?: string;

  public readonly surname: string;

  public readonly username: Username;

  public readonly password: Password;

  public readonly email: Email;

  public constructor(
    first_name: string,
    middle_name: string | undefined,
    surname: string,
    is_admin: boolean,
    username: Username,
    password: Password,
    email: string,
    id?: UserID
  ) {
    this.username = username;
    this.password = password;
    if (first_name.trim() === '') {
      throw new InvalidFirstName();
    }
    if (surname.trim() === '') {
      throw new InvalidSurname();
    }

    this.first_name = first_name;
    this.middle_name = middle_name;
    this.surname = surname;
    this.email = Email.from_string(email);
    this.role = is_admin ? UserRole.SYS_ADMIN : UserRole.SIMPLE;
    this.id = id;
  }
}
