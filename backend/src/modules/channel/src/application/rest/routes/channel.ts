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

function room_to_json(channel: Channel): any {
  return {
    self: `${API_VERSION}${BASE_PATH}/${channel.id!.to_string()}`,
    name: channel.name,
    description: channel.description,
    presidents: {
      president1: channel.presidents[0],
      president2: channel.presidents[1],
      president3: channel.presidents[2],
      president4: channel.presidents[3]
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
  response.status(StatusCodes.OK).json((channel));
}

export function init_channel_routes(): express.Router {
  const router = express.Router();

  router.get(`${BASE_PATH}/:channel_id`, asyncHandler(get_channel));

  return router;
}
