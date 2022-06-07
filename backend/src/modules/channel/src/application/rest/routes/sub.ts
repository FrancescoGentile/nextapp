//
//
//

import { StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import express from 'express';
import { asyncHandler, validate } from '../utils';
import { ChannelID } from '../../../domain/models/channel';
import { SearchOptions } from '../../../domain/models/search';
import { Sub, SubID } from '../../../domain/models/sub';

function subscription_to_json(subscription: Sub): any {
  return {
    self: `/users/me/subscriptions/${subscription.id!.to_string()}`,
    channel: {
      self: `/channels/${subscription.channel.to_string()}`,
    },
    user: {
      self: `/users/${subscription.user.to_string()}`,
    },
  };
}

async function get_user_subscriptions(request: Request, response: Response) {
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

async function delete_subscriber(request: Request, response: Response) {
  await request.sub_service!.delete_subscriber(
    request.user_id!,
    SubID.from_string(request.params.subscriber_id)
  );
  response.sendStatus(StatusCodes.NO_CONTENT);
}

async function get_club_subscribers(request: Request, response: Response) {
  const subs = await request.sub_service!.get_club_subscribers(
    request.user_id!,
    ChannelID.from_string(request.params.channel_id)
  );
  response.status(StatusCodes.OK).json(subs.map(subscription_to_json));
}

export function init_sub_routes(): express.Router {
  const router = express.Router();

  router.get('/users/me/subscribtions', asyncHandler(get_user_subscriptions));
  router.delete(
    `/channels/:channel_id/subscribers/:subscriber_id`,
    asyncHandler(delete_subscriber)
  );
  router.get(
    `/channels/:channel_id/subscribers`,
    asyncHandler(get_club_subscribers)
  );

  return router;
}
