//
//
//

import { StatusCodes } from '@nextapp/common/error';
import Joi from 'joi';
import { Request, Response } from 'express-serve-static-core';
import express from 'express';
import { DateTime } from 'luxon';
import { asyncHandler, AuthMiddleware, COOKIE_NAME, validate } from '../utils';
import { AuthToken } from '../../../domain/models/auth';
import { Username } from '../../../domain/models/credentials';

async function login(request: Request, response: Response) {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const value = validate(schema, request.body);

  const token = await request.auth_service.login_with_credentials(
    value.username,
    value.password
  );

  const expires = DateTime.utc().plus(AuthToken.ttl());
  const accept = request.header('Accept');
  if (accept !== undefined && accept.includes('cookie')) {
    response
      .status(StatusCodes.NO_CONTENT)
      .cookie(COOKIE_NAME, token.to_string(), {
        secure: true,
        httpOnly: true,
        expires: expires.toJSDate(),
      })
      .end();
  } else {
    response
      .status(StatusCodes.OK)
      .json({ token: token.to_string(), expires: expires.toISO() });
  }
}

async function forgot_password(request: Request, response: Response) {
  const schema = Joi.object({
    username: Joi.string().required(),
  });

  const value = validate(schema, request.body);
  await request.user_service.forgot_password(
    Username.from_string(value.username)
  );

  response.sendStatus(StatusCodes.ACCEPTED);
}

function logout(request: Request, response: Response) {
  response.status(StatusCodes.NO_CONTENT).clearCookie(COOKIE_NAME).send();
}

export function init_auth_routes(
  auth_middleware: AuthMiddleware
): express.Router {
  const router = express.Router();

  router.post('/login', asyncHandler(login));
  router.post('/forgot-password', asyncHandler(forgot_password));
  router.post('/logout', auth_middleware, asyncHandler(logout));

  return router;
}
