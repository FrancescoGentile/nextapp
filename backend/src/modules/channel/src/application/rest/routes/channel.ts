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
  ChannelNotFound
} from '../../../domain/errors'
import { SearchOptions } from '../../../domain/models/search';

const BASE_PATH = '/channels';

function channel_to_json(channel: Channel): any {
  return {
    self: `${API_VERSION}${BASE_PATH}/${channel.id!.to_string()}`,
    name: channel.name,
    description: channel.description,
    array: Joi.array().items(Joi.string())
  };
}

async function get_channel(request: Request, response: Response){
  let id;
  try {
    id = ChannelID.from_string(request.params.room_id);
  } catch {
    throw new ChannelNotFound(request.params.room_id);
  }

  const channel = await request.channel_service!.get_channel(id);
  response.status(StatusCodes.OK).json(channel_to_json(channel));
}

async function create_channel(request: Request, response: Response){
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    presID_array: Joi.array().items(Joi.string())
  });

  const value = validate(schema, request.body);

  const id = await request.channel_service!.create_channel(
    request.user_id!,
    new Channel(value.name, value.description, value.presID_array)
  );

  response
    .status(StatusCodes.CREATED)
    .location(`${API_VERSION}${BASE_PATH}/${id.to_string()}`)
    .end();
}

async function get_channel_list(request: Request, response: Response) {
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
  });
  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
  });
  const options = SearchOptions.build(value.offset, value.limit);

  const users = await request.channel_service!.get_channel_list(
    request.user_id!,
    options
  );
  response.status(StatusCodes.OK).json(users.map(channel_to_json));
}

export function init_channel_routes(): express.Router {
  const router = express.Router();

  router.get(BASE_PATH, asyncHandler(get_channel_list));
  router.get(`${BASE_PATH}/:channel_id`, asyncHandler(get_channel));
  router.post(`${BASE_PATH}`, asyncHandler(create_channel));

  return router;
}