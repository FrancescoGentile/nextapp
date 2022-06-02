//
//
//

import { StatusCodes } from 'http-status-codes';

export { StatusCodes, ReasonPhrases } from 'http-status-codes';

/**
 * Custom implementation of Javascript Error class based on RFC 7807
 * for HTTP error handling.
 * This it the error type that should always be returned to the user.
 */
export class NextError extends Error {
  public constructor(
    type: string,
    code: number,
    title: string,
    details?: any,
    options?: ErrorOptions
  ) {
    super(title, options);

    this.name = type;
    this.code = code;
    this.details = details;
  }

  public readonly code: number;

  public readonly details: any;

  public instance?: string;

  public get type(): string {
    return this.name;
  }

  public get title(): string {
    return this.message;
  }

  public toJSON() {
    return {
      type: this.type,
      code: this.code,
      title: this.title,
      details: this.details,
      instance: this.instance,
    };
  }
}

export class InternalServerError extends NextError {
  public constructor(details?: any, options?: ErrorOptions) {
    super(
      'server-001',
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal Server Error',
      details,
      options
    );
  }
}

// ---------------------------------------
// --------------- REQUEST ---------------
// ---------------------------------------

enum RequestErrorTypes {
  INVALID_REQUEST = 1,
  INVALID_API_VERSION = 2,
  NOT_FOUND = 3,
}

function get_request_type(type: RequestErrorTypes): string {
  return `request-${String(type).padStart(3, '0')}`;
}

export class InvalidRequestError extends NextError {
  public constructor(format: any, options?: ErrorOptions) {
    super(
      get_request_type(RequestErrorTypes.INVALID_REQUEST),
      StatusCodes.BAD_REQUEST,
      'Invalid request',
      format,
      options
    );
  }
}

export class InvalidAPIVersion extends NextError {
  public constructor(versions: [string], options?: ErrorOptions) {
    super(
      get_request_type(RequestErrorTypes.INVALID_API_VERSION),
      StatusCodes.NOT_ACCEPTABLE,
      'Invalid API version',
      `For this endpoint valid API versions are ${versions.join(', ')}`,
      options
    );
  }
}

export class NotFoundError extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_request_type(RequestErrorTypes.NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Resource not found',
      undefined,
      options
    );
  }
}
