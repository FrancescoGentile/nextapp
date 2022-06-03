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

const BASE_PATH = '/channels';


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
      .location(`${API_VERSION}${BASE_PATH}/${channel_id.to_string()}/subscribers/}`)
      .end();
  }

  export function init_sub_routes(): express.Router {
    const router = express.Router();
  
    router.post(`${BASE_PATH}/:channel_id/subscribers`, asyncHandler(create_subscriber));

    return router;
  }