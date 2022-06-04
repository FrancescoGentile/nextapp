//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';

export { InternalServerError } from '@nextapp/common/error';

enum UserErrorTypes {
  INVALID_FIRST_NAME = 1,
  INVALID_MIDDLE_NAME,
  INVALID_SURNAME,
  INVALID_USERNAME,
  INVALID_PASSWORD,
  INVALID_USERID,
  USED_USERNAME,
  INVALID_EMAIL,
  OLD_PASSWORD_WRONG,
  INVALID_PICTURE,
  NOT_ADMIN,
  PICTURE_NOT_FOUND,
}

function get_user_type(type: UserErrorTypes): string {
  return `user-${String(type).padStart(3, '0')}`;
}

export class InvalidFirstName extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_FIRST_NAME),
      StatusCodes.BAD_REQUEST,
      'Invalid first name',
      'Your first name cannot be empty.',
      options
    );
  }
}

export class InvalidMiddleName extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_FIRST_NAME),
      StatusCodes.BAD_REQUEST,
      'Invalid middle name',
      'Your middle name cannot be empty.',
      options
    );
  }
}

export class InvalidSurname extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_SURNAME),
      StatusCodes.BAD_REQUEST,
      'Invalid surname',
      'Your surname cannot be empty.',
      options
    );
  }
}

export class InvalidUsername extends NextError {
  public constructor(username: string, options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_USERNAME),
      StatusCodes.BAD_REQUEST,
      'Invalid username',
      `${username} does not meet one or both of the following conditions:` +
        'length between 5 and 100 characters,' +
        'consisting only of lowercase and uppercase Latin letters, Arabic numerals and underscores.',
      options
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
      options
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
      options
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
      options
    );
  }
}

export class InvalidUserID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_USERID),
      StatusCodes.BAD_REQUEST,
      'Invalid user ID',
      `${id} is not a valid user-id`,
      options
    );
  }
}

export class UserNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_USERID),
      StatusCodes.NOT_FOUND,
      'User not found',
      `No user with id ${id} was found.`,
      options
    );
  }
}

export class PictureNotFound extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.PICTURE_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Picture not found',
      'You have to upload a picture first.',
      options
    );
  }
}

export class OldPasswordWrong extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.OLD_PASSWORD_WRONG),
      StatusCodes.BAD_REQUEST,
      'Wrong old password',
      undefined,
      options
    );
  }
}

export class InvalidPicture extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_user_type(UserErrorTypes.INVALID_PICTURE),
      StatusCodes.UNSUPPORTED_MEDIA_TYPE,
      'Invalid picture',
      'No picture was provided or the media type was not accepted.',
      options
    );
  }
}

// ----------------------------------------------
// -------------------- AUTH --------------------
// ----------------------------------------------

export enum AuthErrorTypes {
  INVALID_CREDENTIALS = 1,
  INVALID_AUTH_TOKEN,
  MISSING_AUTH_TOKEN,
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

export class MissingAuthToken extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_auth_type(AuthErrorTypes.MISSING_AUTH_TOKEN),
      StatusCodes.UNAUTHORIZED,
      'Missing token',
      'You need to authenticate before using the API.',
      options
    );
  }
}
