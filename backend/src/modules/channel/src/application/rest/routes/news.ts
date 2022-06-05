//
//
//

import { StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import express from 'express';
import { DateTime } from 'luxon';
import { asyncHandler, validate } from '../utils';
import { News, NewsID } from '../../../domain/models/news';
import { ChannelNotFound, NewsNotFound } from '../../../domain/errors';
import { SearchOptions } from '../../../domain/models/search';
import { ChannelID } from '../../../domain/models/channel';

function id_to_self(id: NewsID): string {
  return `news/${id.to_string()}`;
}

function news_to_json(news: News): any {
  return {
    self: id_to_self(news.id!),
    channel: {
      self: news.channel.to_string(),
    },
    author: {
      self: news.author.to_string,
    },
    date: news.date.toISO(),
    title: news.title,
    body: news.body,
  };
}

async function get_news_list(request: Request, response: Response) {
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
  });
  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
  });
  const options = SearchOptions.build(value.offset, value.limit);

  const news = await request.news_service!.get_news_list(
    request.user_id!,
    options
  );
  response.status(StatusCodes.OK).json(news.map(news_to_json));
}

async function get_news_list_by_channel(request: Request, response: Response) {
  let id: ChannelID;
  try {
    id = ChannelID.from_string(request.params.channel_id);
  } catch {
    throw new ChannelNotFound(request.params.channel_id);
  }

  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
  });
  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
  });
  const options = SearchOptions.build(value.offset, value.limit);

  const news = await request.news_service!.get_news_list_by_channel(
    request.user_id!,
    id,
    options
  );
  response.status(StatusCodes.OK).json(news);
}

async function get_single_news(request: Request, response: Response) {
  let id;
  try {
    id = NewsID.from_string(request.params.news_id);
  } catch {
    throw new NewsNotFound(request.params.news_id);
  }

  const news = await request.news_service!.get_news_info(request.user_id!, id);
  response.status(StatusCodes.OK).json(news_to_json(news));
}

async function create_news(request: Request, response: Response) {
  const schema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
  });

  const value = validate(schema, request.body);

  let channel_id: ChannelID;
  try {
    channel_id = ChannelID.from_string(request.query.channel_id);
  } catch {
    throw new ChannelNotFound(request.query.channel_id);
  }

  const news = new News(
    channel_id,
    request.user_id!,
    DateTime.utc(),
    value.title,
    value.body
  );

  const id = await request.news_service!.create_news(news);

  response.status(StatusCodes.CREATED).location(id_to_self(id)).end();
}

async function update_news(request: Request, response: Response) {
  const schema = Joi.object({
    title: Joi.string(),
    body: Joi.string(),
  });

  const value = validate(schema, request.body);

  let id;
  try {
    id = NewsID.from_string(request.params.event_id);
  } catch {
    throw new NewsNotFound(request.params.event_id);
  }

  await request.news_service!.update_news(
    request.user_id!,
    id,
    value.title,
    value.body
  );

  response.sendStatus(StatusCodes.NO_CONTENT);
}

async function delete_news(request: Request, response: Response) {
  let id: NewsID;
  try {
    id = NewsID.from_string(request.params.event_id);
  } catch {
    throw new NewsNotFound(request.params.event_id);
  }

  await request.news_service!.delete_news(request.user_id!, id);
  response.sendStatus(StatusCodes.NO_CONTENT);
}

export function init_news_routes(): express.Router {
  const router = express.Router();

  router.get('/news/:news_id', asyncHandler(get_single_news));
  router.get('/news', asyncHandler(get_news_list));
  router.get(
    '/channels/:channel_id/news',
    asyncHandler(get_news_list_by_channel)
  );

  router.post('/channel/:channel_id/news', asyncHandler(create_news));

  router.patch('/news/:news_id', asyncHandler(update_news));

  router.delete('/news/:news_id', asyncHandler(delete_news));

  return router;
}
