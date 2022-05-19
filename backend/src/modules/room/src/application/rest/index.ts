//
//
//

import { InternalServerError, NextError } from '@nextapp/common/error';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import express from 'express';
import { RoomInfoService } from '../../domain/ports/room.service';
import { init_room_routes } from './routes/room';

function init_request(
  room_service: RoomInfoService
): (req: Request, res: Response, next?: NextFunction) => void {
  return (req: Request, _res: Response, next?: NextFunction) => {
    req.room_service = room_service;
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

export function init_rest_api(room_service: RoomInfoService) {
  const router = express.Router();

  router.use(express.urlencoded() as any);
  router.use(express.json() as any);

  router.use(init_request(room_service));

  router.use(init_room_routes());

  router.use(handle_error);

  return router;
}
