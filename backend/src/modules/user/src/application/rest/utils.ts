//
//
//

import { InvalidRequestError, NextError } from '@nextapp/common/error';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import Joi, { toJson } from 'json-joi-converter';
import { MissingAuthToken } from '../../domain/errors';
import { AuthToken } from '../../domain/models/auth';
import { AuthService } from '../../domain/ports/auth.service';

export const API_VERSION = '/api/v1';

export const COOKIE_NAME = 'jwt';

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

export type AuthMiddleware = (
  request: Request,
  response: Response,
  next?: NextFunction
) => void;

export function verify_token(auth_service: AuthService): AuthMiddleware {
  return async (request: Request, response: Response, next?: NextFunction) => {
    try {
      const cookie = request.cookies[COOKIE_NAME];
      if (cookie === undefined) {
        throw new MissingAuthToken();
      }
      const token = new AuthToken(request.cookies.jwt);
      request.user_id = auth_service.authenticate(token);
      next!();
    } catch (e) {
      const error = e as NextError;
      error.instance = request.url;
      response.status(error.code).json(error);
    }
  };
}
