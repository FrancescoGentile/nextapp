
import { News } from '../../../domain/models/news';
import { API_VERSION, asyncHandler, validate } from '../utils';
import { StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import express from 'express';
import { NewsID } from '../../../domain/models/news';
import { NewsNotFound } from '../../../domain/errors';

const BASE_PATH = '/news';

function news_to_json(news:News): any {
    return {
        self: `${API_VERSION}${BASE_PATH}/${news.id!.to_string()}`,
        id: news.id!.to_string(),
        title: news.title,
        author: news.author,
        date: news.date.toString(),
        body: news.body,
        channel: news.channel.toString()
    };
}

async function get_news_list(request: Request, response: Response) {
    const news = await request.news_service!.get_news_list(request.user_id!);
    response.status(StatusCodes.OK).json(news);
}

async function get_news_list_by_channel(request: Request, response: Response) {
    const news = await request.news_service!.get_news_list_by_channel(request.user_id!, request.params.channel_id);
    response.status(StatusCodes.OK).json(news);
}

async function get_single_news(request: Request, response: Response) {
    let id;
    try {
        id = NewsID.from_string(request.params.news_id);
    } catch {
        throw new NewsNotFound(request.params.news_id);
    }

    const event = await request.news_service!.get_news_info(request.user_id!,id);
}



async function create_news(request: Request, response: Response) {
    const schema = Joi.object({
        title: Joi.string().required(),
        author: Joi.string().required(),
        date: Joi.date().required(),
        body: Joi.string().required(),
        channel: Joi.string().required()
       
    });

    
    const value = validate(schema, request.body);

    const id = await request.news_service!.create_news(
        request.user_id!,value.channel,
        new News(value.title,value.author, value.date, value.body, value.channel)
    );

    response
        .status(StatusCodes.CREATED)
        .location(`${API_VERSION}${BASE_PATH}/${id.to_string()}`)
        .end();
}

async function update_news(request: Request, response: Response) {
    const schema = Joi.object({
        name: Joi.string().required(),
        channel: Joi.string().required(),
        description: Joi.string().required(),
        start: Joi.string().required(),
        end: Joi.string().required(),
        room: Joi.string().required()
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
        value.date,
        value.body
    );
  
    response.sendStatus(StatusCodes.NO_CONTENT);
}

async function delete_news(request: Request, response: Response) {
    await request.news_service!.delete_news(
      request.user_id!,
      NewsID.from_string(request.params.event_id)
    );
    response.sendStatus(StatusCodes.NO_CONTENT);
}



export function init_event_routes(): express.Router{
    const router = express.Router();

    router.get(`${BASE_PATH}`, asyncHandler(get_news_list));
    router.get(`${BASE_PATH}/:room_id`, asyncHandler(get_single_news));
    router.get(`/:channel_id/${BASE_PATH}`, asyncHandler(get_news_list_by_channel));
    router.post(`${BASE_PATH}`, asyncHandler(create_news));
    router.put(`${BASE_PATH}/:news_id`, asyncHandler(update_news));
    router.delete(`${BASE_PATH}/:news_id`, asyncHandler(delete_news));

    return router;
}   