//
//
//

import { InternalServerError, NextError } from '@nextapp/common/error';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import express from 'express';
import { init_channel_routes } from './routes/channel';
import { ChannelInfoService } from '../../domain/ports/channel.service';
import { EventInfoService } from '../../domain/ports/event.service';
import { init_event_routes } from './routes/event';
import { API_VERSION } from './utils';

function init_request(
  channel_service: ChannelInfoService,
  event_service: EventInfoService
): (req: Request, res: Response, next?: NextFunction) => void {
  return (req: Request, _res: Response, next?: NextFunction) => {
    req.channel_service = channel_service;
    req.event_service = event_service;
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
  channel_service: ChannelInfoService,
  event_service: EventInfoService
): { router: express.Router } {
  const router = express.Router();

  router.use(express.urlencoded() as any);
  router.use(express.json() as any);
  
  router.use(init_request(channel_service, event_service));

  router.use(API_VERSION, init_channel_routes(), handle_error);
  router.use(API_VERSION, init_event_routes(), handle_error);

  return { router };
}
