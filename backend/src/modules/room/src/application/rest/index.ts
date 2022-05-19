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

function handle_error(req: Request, res: Response, next?: NextFunction) {
  try {
    next!();
  } catch (e) {
    if (e instanceof NextError) {
      res.status(e.code).send(e);
    } else {
      const error = new InternalServerError();
      res.status(error.code).send(error);
    }
  }
}

export function init_rest_api(room_service: RoomInfoService): express.Router {
  const router = express.Router();

  router.use(express.urlencoded() as any);
  router.use(express.json() as any);

  router.use(handle_error);
  router.use(init_request(room_service));

  router.use(init_room_routes());

  return router;
}
