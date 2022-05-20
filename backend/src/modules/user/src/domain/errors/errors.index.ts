//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';

export { InternalServerError } from '@nextapp/common/error';

enum UserErrorTypes {
  INVALID_USERNAME = 1,
  INVALID_PASSWORD,
  INVALID_USERID,
  USED_USERNAME,
  NOT_ADMIN
}

function get_error_type(type: UserErrorTypes): string {
  return `auth-${String(type).padStart(3, '0')}`;
}

export class InvalidUsername extends NextError {
  public constructor(username: string, options?: ErrorOptions) {
    super(
      get_error_type(UserErrorTypes.INVALID_USERNAME),
      StatusCodes.BAD_REQUEST,
      'Invalid username',
      `${username} does not meet one or both of the following conditions:`
      + 'length between 5 and 100 characters,'
      + 'consisting only of lowercase and uppercase Latin letters, Arabic numerals and underscores.',
      options,
    );
  }
}

export class InvalidPassword extends NextError {
  public constructor(warning: string, options?: ErrorOptions) {
    super(
      get_error_type(UserErrorTypes.INVALID_PASSWORD),
      StatusCodes.BAD_REQUEST,
      'Invalid password',
      warning,
      options,
    );
  }
}

export class UsernameAlreadyUsed extends NextError {
  public constructor(username: string, options?: ErrorOptions) {
    super(
      get_error_type(UserErrorTypes.USED_USERNAME),
      StatusCodes.CONFLICT,
      'Username already used',
      `${username} is already used. Try to choose another username.`,
      options,
    );
  }
}

export class NotAnAdmin extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_error_type(UserErrorTypes.NOT_ADMIN),
      StatusCodes.UNAUTHORIZED,
      'Not an admin',
      `This action requires admin priviledges.`,
      options,
    );
  }
}

export class InvalidUserID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_error_type(UserErrorTypes.INVALID_USERID),
      StatusCodes.BAD_REQUEST,
      'Invalid user ID',
      `${id} is not a valid id for a room`,
      options,
    );
  }
}