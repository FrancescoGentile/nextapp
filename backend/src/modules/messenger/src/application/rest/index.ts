//
//
//

import { InternalServerError, NextError } from '@nextapp/common/error';
import express from 'express';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { UserInfoService } from '../../domain/ports/info.service';
import { init_device_routes } from './routes/device';
import { init_email_routes } from './routes/email';

function init_request(
  info_service: UserInfoService
): (req: Request, res: Response, next?: NextFunction) => void {
  return (req: Request, _res: Response, next?: NextFunction) => {
    req.info_service = info_service;
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

export function init_rest_api(info_service: UserInfoService): express.Router {
  const router = express.Router();

  router.use(express.urlencoded() as any);
  router.use(express.json() as any);

  router.use(init_request(info_service));

  router.use(init_email_routes());
  router.use(init_device_routes());

  router.use(handle_error);

  return router;
}
