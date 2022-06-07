//
//
//

import { InvalidRequestError } from '@nextapp/common/error';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { toJson } from 'json-joi-converter';

export const asyncHandler =
  (fn: any) => (req: Request, res: Response, next?: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function validate(schema: Joi.ObjectSchema<any>, data: any): any {
  const { error, value } = schema.validate(data);
  if (error !== undefined) {
    throw new InvalidRequestError({
      cause: error.message,
      format: toJson(schema),
    });
  }

  return value;
}
