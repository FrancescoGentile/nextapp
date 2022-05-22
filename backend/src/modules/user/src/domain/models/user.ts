//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { Username, Password } from './user.credentials';
import { Email } from './email';
import { InvalidFirstName, InvalidSurname } from '../errors/errors.index';

// TODO: check first_name, last_name not empty

export class User {
  public id?: UserID;

  public readonly role: UserRole;

  public readonly first_name: string;

  public readonly middle_name: string;

  public readonly surname: string;

  public readonly username: Username;

  public readonly password: Password;

  public readonly email: Email;

  public constructor(
    first_name: string,
    surname: string,
    is_admin: boolean,
    username: Username,
    password: Password,
    email: string,
    id?: UserID,
    middle_name?: string
  ) {
    this.username = username;
    this.password = password;
    if (/^[a-zA-Z]+$/.test(first_name)) {
      throw new InvalidFirstName(first_name);
    }
    if (/^[a-zA-Z]+$/.test(surname)) {
      throw new InvalidSurname(surname);
    }

    this.first_name = first_name;
    this.surname = surname;
    this.email = Email.from_string(email);
    this.role = is_admin ? UserRole.SYS_ADMIN : UserRole.SIMPLE;
    this.middle_name = middle_name ?? '';
    this.id = id;
  }

  public toJson() {
    return {
      id: this.id,
      first_name: this.first_name,
      middle_name: this.middle_name,
      last_name: this.surname,
      is_admin: this.role === UserRole.SYS_ADMIN,
      username: this.username.to_string(),
      password: this.password.to_string(),
      email: this.email.to_string(),
    };
  }
}
