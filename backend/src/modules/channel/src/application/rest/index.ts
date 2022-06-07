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
import { init_channel_routes } from './routes/channel';
import { init_sub_routes } from './routes/sub';
import { ChannelInfoService } from '../../domain/ports/channel.service';
import { SubService } from '../../domain/ports/sub.service';
import { init_news_routes } from './routes/news';
import { NewsInfoService } from '../../domain/ports/news.service';
import { EventInfoService } from '../../domain/ports/event.service';
import { init_event_routes } from './routes/event';

function init_request(
  channel_service: ChannelInfoService,
  sub_service: SubService,
  news_service: NewsInfoService,
  event_service: EventInfoService
): (req: Request, res: Response, next?: NextFunction) => void {
  return (req: Request, _res: Response, next?: NextFunction) => {
    req.channel_service = channel_service;
    req.sub_service = sub_service;
    req.news_service = news_service;
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
  channel_service: ChannelInfoService,
  sub_service: SubService,
  news_service: NewsInfoService,
  event_service: EventInfoService
): express.Router {
  const router = express.Router();

  router.use(versionRequest.setVersionByAcceptHeader());
  router.use(check_api_version);

  router.use(express.urlencoded() as any);
  router.use(express.json() as any);
  router.use(
    init_request(channel_service, sub_service, news_service, event_service)
  );

  router.use(init_channel_routes(), handle_error);
  router.use(init_sub_routes(), handle_error);

  router.use(init_channel_routes(), handle_error);
  router.use(init_sub_routes(), handle_error);
  router.use(init_news_routes(), handle_error);
  router.use(init_event_routes(), handle_error);

  return router;
}
