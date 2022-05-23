//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';

export class InvalidEndpoint extends NextError {
  public constructor(url: string, options?: ErrorOptions) {
    super(
      'request-002',
      StatusCodes.NOT_FOUND,
      'Invalid endpoint',
      `${url} is not associated to any operation.`,
      options
    );
  }
}
