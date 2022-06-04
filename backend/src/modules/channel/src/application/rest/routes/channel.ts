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
  ChannelNotFound, InvalidSubscribeChannel
} from '../../../domain/errors'
import { SearchOptions } from '../../../domain/models/search';
import { UserID } from '@nextapp/common/user';

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

  const channels = await request.channel_service!.get_channel_list(
    request.user_id!,
    options
  );
  response.status(StatusCodes.OK).json(channels.map(channel_to_json));
}

async function delete_channel(request: Request, response: Response) {
  await request.channel_service!.delete_channel(
    request.user_id!,
    ChannelID.from_string(request.params.channel_id)
  );
  response.sendStatus(StatusCodes.NO_CONTENT);
}

async function create_subscriber(request: Request, response: Response){

  const schema = Joi.object({
    channel: Joi.object({
      self: Joi.string().required(),
    }).required(),
  });

  const value = validate(schema, request.body);
  const path = value.channel.self;
  const regex = /^\/api\/v1\/${BASE_PATH}\/(.*)$/;
  const match = path.match(regex);

  if (match === null) {
    throw new InvalidSubscribeChannel();
  }

  let channel_id;
  try {
    channel_id = ChannelID.from_string(match[1]);
  } catch {
    throw new InvalidSubscribeChannel();
  }

  const id = await request.sub_service!.create_sub(
    request.user_id!,
    channel_id
  );

  response
    .status(StatusCodes.CREATED)
    .location(`${API_VERSION}${BASE_PATH}/${channel_id.to_string()}/subscribers/${id.to_string()}`)
    .end();
}

async function get_pres_channels(request: Request, response: Response){
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
  });
  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
  });
  const options = SearchOptions.build(value.offset, value.limit);

  const users = await request.channel_service!.get_pres_channels(
    request.user_id!,
    options
  );
  response.status(StatusCodes.OK).json(users.map(channel_to_json));
}

async function update_channel(request: Request, response: Response){
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required()
  });

  const value = validate(schema, request.body);

  let channel_id;
  try {
    channel_id = ChannelID.from_string(request.params.channel_id);
  } catch {
    throw new ChannelNotFound(request.params.channel_id);
  }

  const empty : UserID[] = [];

  await request.channel_service!.update_channel(
    request.user_id!,
    new Channel( value.name, value.description, empty, channel_id)
  );

  response.sendStatus(StatusCodes.NO_CONTENT);
}

async function get_channel_by_name(request: Request, response: Response){
  
  const channel_name = request.params.channel_name;

  const channel = await request.channel_service!.get_channel_by_name(channel_name);
  response.status(StatusCodes.OK).json(channel_to_json(channel));
}

export function init_channel_routes(): express.Router {
  const router = express.Router();

  router.get(BASE_PATH, asyncHandler(get_channel_list));
  router.post(`${BASE_PATH}`, asyncHandler(create_channel));

  router.get(`${BASE_PATH}/:channel_id`, asyncHandler(get_channel));
  router.delete(`${BASE_PATH}/:channel_id`, asyncHandler(delete_channel));
  router.patch(`${BASE_PATH}/:channel_id`, asyncHandler(update_channel));

  router.get(`${BASE_PATH}/:channel_name`, asyncHandler(get_channel_by_name));

  router.post(`${BASE_PATH}/:channel_id/subscribers`, asyncHandler(create_subscriber));

  router.get(`users/me/president`, asyncHandler(get_pres_channels));

  return router;
}
