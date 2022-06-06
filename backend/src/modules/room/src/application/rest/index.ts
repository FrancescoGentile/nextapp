//
//
//

import {
  InternalServerError,
  InvalidAPIVersion,
  NextError,
} from '@nextapp/common/error';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import express from 'express';
import versionRequest from 'express-version-request';
import { RoomInfoService } from '../../domain/ports/room.service';
import { init_room_routes } from './routes/room';
import { BookingService } from '../../domain/ports/booking.service';
import { init_booking_routes } from './routes/booking';

function init_request(
  room_service: RoomInfoService,
  booking_service: BookingService
): (req: Request, res: Response, next?: NextFunction) => void {
  return (req: Request, _res: Response, next?: NextFunction) => {
    req.room_service = room_service;
    req.booking_service = booking_service;
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

function check_api_version(
  request: Request,
  response: Response,
  next?: NextFunction
) {
  // if the version is not specified, we use the last available version
  if (request.version === '2.0.0' || request.version === undefined) {
    next!();
  } else {
    const error = new InvalidAPIVersion(['2.0.0']);
    response.status(error.code).json(error);
  }
}

export function init_rest_api(
  room_service: RoomInfoService,
  booking_service: BookingService
) {
  const router = express.Router();

  router.use(versionRequest.setVersionByAcceptHeader());
  router.use(check_api_version);

  router.use(express.urlencoded() as any);
  router.use(express.json() as any);

  router.use(init_request(room_service, booking_service));

  router.use(init_room_routes());
  router.use(init_booking_routes());

  router.use(handle_error);

  return router;
}
