//
//
//

import { StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import express, { Router } from 'express';
import { DateTime } from 'luxon';
import { API_VERSION, asyncHandler, validate } from '../utils';
import {
  Channel,
  ChannelID
} from '../../../domain/models/channel'
import{
    InvalidSubscribeChannel
} from '../../../domain/errors'
import { SearchOptions } from '../../../domain/models/search';

const BASE_PATH = '/user/me/subscriptions';

function channel_to_json(channel: Channel): any {
  return {
    self: `${API_VERSION}${BASE_PATH}/${channel.id!.to_string()}`,
    name: channel.name,
    description: channel.description,
    array: Joi.array().items(Joi.string())
  };
}

async function get_user_subscriptions(request: Request, response: Response){
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
  });

  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
  });

  const sub_channels = await request.sub_service!.get_user_subscriptions(
    request.user_id!,
    SearchOptions.build(value.offset, value.limit)
  );

  response.status(StatusCodes.OK).json(sub_channels!.map(channel_to_json));

}

export function init_sub_routes(): express.Router {
  const router = express.Router();
  
  router.get(`${BASE_PATH}`, asyncHandler(get_user_subscriptions));

  return router;
}