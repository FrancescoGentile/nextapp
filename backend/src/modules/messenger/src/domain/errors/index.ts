//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';

enum EmailErrorTypes {
  INVALID_EMAIL = 1,
  INVALID_EMAIL_ID,
  ALREADY_USED_EMAIL,
}

function get_email_type(type: EmailErrorTypes): string {
  return `user-${String(type).padStart(3, '0')}`;
}

export class InvalidEmail extends NextError {
  public constructor(email: string, options?: ErrorOptions) {
    super(
      get_email_type(EmailErrorTypes.INVALID_EMAIL),
      StatusCodes.BAD_REQUEST,
      'Invalid email',
      `${email} is not a valid email.`,
      options
    );
  }
}

export class InvalidEmailID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_email_type(EmailErrorTypes.INVALID_EMAIL_ID),
      StatusCodes.BAD_REQUEST,
      'Invalid id',
      `${id} is not a valid id for an email.`,
      options
    );
  }
}

export class AlreadyUsedEmail extends NextError {
  public constructor(email: string, options?: ErrorOptions) {
    super(
      get_email_type(EmailErrorTypes.ALREADY_USED_EMAIL),
      StatusCodes.CONFLICT,
      'Alread used email',
      `You have already added the email ${email}.`,
      options
    );
  }
}
