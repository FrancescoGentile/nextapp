//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';

enum EmailErrorTypes {
  INVALID_EMAIL = 1,
  INVALID_EMAIL_ID,
  EMAIL_NOT_FOUND,
  ALREADY_USED_EMAIL,
  DELETING_MAIN_EMAIL,
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

export class EmailNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_email_type(EmailErrorTypes.EMAIL_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Email not found',
      `No email with the id ${id} was found in your saved emails.`,
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

export class DeletingMainEmail extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_email_type(EmailErrorTypes.DELETING_MAIN_EMAIL),
      StatusCodes.CONFLICT,
      'Deleting main email',
      `You cannot delete your main email. ` +
        `To delete this email, please set another one as the main one.`,
      options
    );
  }
}
