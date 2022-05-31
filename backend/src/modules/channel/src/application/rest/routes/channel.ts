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

const BASE_PATH = '/channels';

function channel_to_json(channel: Channel): any {
  return {
    self: `${API_VERSION}${BASE_PATH}/${channel.id!.to_string()}`,
    name: channel.name,
    description: channel.description,
    presidents: {
      president1: channel.presID_array[0],
      president2: channel.presID_array[1],
      president3: channel.presID_array[2],
      president4: channel.presID_array[3]
    }
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
    presidents: {
      president1: Joi.string().required(),
      president2: Joi.string(),
      president3: Joi.string(),
      president4: Joi.string()
    }
  });

  const value = validate(schema, request.body);
  
  let presID_array: string[] = Object.values(value.presidents);

  const id = await request.channel_service!.create_channel(
    request.user_id!,
    new Channel(value.name, value.description, presID_array)
  );

  response
    .status(StatusCodes.CREATED)
    .location(`${API_VERSION}${BASE_PATH}/${id.to_string()}`)
    .end();
}


export function init_channel_routes(): express.Router {
  const router = express.Router();

  router.get(`${BASE_PATH}/:channel_id`, asyncHandler(get_channel));
  router.post(`${BASE_PATH}`, asyncHandler(create_channel));

  return router;
}
