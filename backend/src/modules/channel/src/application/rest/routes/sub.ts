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
import { Sub, SubID } from '../../../domain/models/sub';

const BASE_PATH = '/users/me/subscriptions';

function subscription_to_json(subscription: Sub): any {
  return {
    self: `${API_VERSION}${BASE_PATH}/${subscription.id!.to_string()}`,
    channel: {
      self: `${API_VERSION}/channels/${subscription.channel.to_string()}`,
    },
    user: {
      self: `${API_VERSION}/users/${subscription.user.to_string()}`
    }

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

  const subs = await request.sub_service!.get_user_subscriptions(
    request.user_id!,
    SearchOptions.build(value.offset, value.limit)
  );

  response.status(StatusCodes.OK).json(subs!.map(subscription_to_json));

}

async function delete_subscriber(request: Request, response: Response){
  await request.sub_service!.delete_subscriber(
    request.user_id!,
    SubID.from_string(request.params.booking_id)
  );
  response.sendStatus(StatusCodes.NO_CONTENT);
}

export function init_sub_routes(): express.Router {
  const router = express.Router();
  
  router.get(`${BASE_PATH}`, asyncHandler(get_user_subscriptions));
  router.delete(`${BASE_PATH}/:channel_id/subscribers/:subscriber_id`, asyncHandler(delete_subscriber));
  
  return router;
}