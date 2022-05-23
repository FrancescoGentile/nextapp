//
//
//

import { StatusCodes } from '@nextapp/common/error';
import Joi from 'joi';
import { Request, Response } from 'express-serve-static-core';
import express from 'express';
import { DateTime } from 'luxon';
import { asyncHandler, AuthMiddleware, COOKIE_NAME, validate } from '../utils';

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

  const expires = DateTime.utc().plus({ hours: 24 });

  response
    .status(StatusCodes.NO_CONTENT)
    .cookie(COOKIE_NAME, token.to_string(), {
      secure: true,
      httpOnly: true,
      expires: expires.toJSDate(),
    })
    .send();
}

function logout(request: Request, response: Response) {
  response.status(StatusCodes.NO_CONTENT).clearCookie(COOKIE_NAME).send();
}

export function init_auth_routes(
  auth_middleware: AuthMiddleware
): express.Router {
  const router = express.Router();

  router.post('/login', asyncHandler(login));

  router.post('/logout', auth_middleware, asyncHandler(logout));

  return router;
}
