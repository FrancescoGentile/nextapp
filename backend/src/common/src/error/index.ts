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
