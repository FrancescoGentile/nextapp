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
  NOT_ADMIN,
  BAD_CREDENTIALS,
  INVALID_EMAIL
}

function get_user_type(type: UserErrorTypes): string {
  return `user-${String(type).padStart(3, '0')}`;
}


export class InvalidUsername extends NextError {
  public constructor(username: string, options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_USERNAME),
      StatusCodes.BAD_REQUEST,
      'Invalid username',
      `${username} does not meet one or both of the following conditions:`
      + 'length between 5 and 100 characters,'
      + 'consisting only of lowercase and uppercase Latin letters, Arabic numerals and underscores.',
      options,
    );
  }
}

export class InvalidEmail extends NextError {
  public constructor(email: string, options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_EMAIL),
      StatusCodes.BAD_REQUEST,
      'Invalid email',
      `${email} is not a valid email.`,
      options
    );
  }
}


export class InvalidPassword extends NextError {
  public constructor(warning: string, options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_PASSWORD),
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
      get_user_type(UserErrorTypes.USED_USERNAME),
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
      get_user_type(UserErrorTypes.NOT_ADMIN),
      StatusCodes.FORBIDDEN,
      'Not an admin',
      `This action requires admin priviledges.`,
      options,
    );
  }
}

export class InvalidUserID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_USERID),
      StatusCodes.BAD_REQUEST,
      'Invalid user ID',
      `${id} is not a valid id for a user`,
      options,
    );
  }
}
  
export class CredentialsNotString extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.BAD_CREDENTIALS),
      StatusCodes.BAD_REQUEST,
      'Bad credentials',
      `Username or password not a string`,
      options,
    );
  }
}

// ----------------------------------------------
// -------------------- AUTH --------------------
// ----------------------------------------------

export enum AuthErrorTypes {
  INVALID_CREDENTIALS = 1,
  INVALID_AUTH_TOKEN,
}

function get_auth_type(type: AuthErrorTypes): string {
  return `user-${String(type).padStart(3, '0')}`;
}

export class InvalidCredentials extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_auth_type(AuthErrorTypes.INVALID_CREDENTIALS),
      StatusCodes.UNAUTHORIZED,
      'Invalid credentials',
      'Username or password are not correct.',
      options
    );
  }
}

export class InvalidAuthToken extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_auth_type(AuthErrorTypes.INVALID_AUTH_TOKEN),
      StatusCodes.UNAUTHORIZED,
      'Invalid token',
      undefined,
      options
    );
  }
}
