//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';

enum EmailErrorTypes {
  INVALID_EMAIL = 1,
}

function get_user_type(type: EmailErrorTypes): string {
  return `user-${String(type).padStart(3, '0')}`;
}

export class InvalidEmail extends NextError {
  public constructor(email: string, options?: ErrorOptions) {
    super(
      get_user_type(EmailErrorTypes.INVALID_EMAIL),
      StatusCodes.BAD_REQUEST,
      'Invalid email',
      `${email} is not a valid email.`,
      options
    );
  }
}
