//
//
//

import { InternalServerError, NextError } from '@nextapp/common/error';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import express from 'express';
import { init_user_routes } from './routes/user';
import { UserInfoService } from '../../domain/ports/user.service';
import { API_VERSION, AuthMiddleware, verify_token } from './utils';
import { AuthService } from '../../domain/ports/auth.service';
import { init_auth_routes } from './routes/auth';

export { AuthMiddleware } from './utils';

function init_request(
  user_service: UserInfoService,
  auth_service: AuthService
): (req: Request, res: Response, next?: NextFunction) => void {
  return (req: Request, _res: Response, next?: NextFunction) => {
    req.user_service = user_service;
    req.auth_service = auth_service;
    next!();
  };
}

function handle_error(
  e: Error,
  req: Request,
  res: Response,
  _next?: NextFunction
) {
  let error;
  if (e instanceof NextError) {
    error = e;
  } else {
    error = new InternalServerError();
  }

  error.instance = req.url;
  res.status(error.code).json(error);
}

export function init_rest_api(
  user_service: UserInfoService,
  auth_service: AuthService
): { router: express.Router; auth_middleware: AuthMiddleware } {
  const router = express.Router();

  router.use(express.urlencoded() as any);
  router.use(express.json() as any);
  router.use(init_request(user_service, auth_service));

  const auth_middleware = verify_token(auth_service);

  router.use(API_VERSION, init_auth_routes(auth_middleware), handle_error);

  router.use(API_VERSION, init_user_routes(auth_middleware), handle_error);

  return { router, auth_middleware };
}
