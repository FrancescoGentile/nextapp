
import { Event } from '../../../domain/models/event';
import { API_VERSION, asyncHandler, validate } from '../utils';
import { StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import express from 'express';
import { EventID } from '../../../domain/models/event';
import { EventNotFound } from '../../../domain/errors/';

const BASE_PATH = '/event';

function event_to_json(event: Event): any {
    return {
        self: `${API_VERSION}${BASE_PATH}/${event.id!.to_string()}`,
        name: event.name,
        details: event.description,
        start: event.start.toString(),
        end: event.end.toString(),
        room: event.room
    };
}

async function get_event_list(request: Request, response: Response) {
    const events = await request.event_service!.get_event_list(request.user_id!);
    response.status(StatusCodes.OK).json(events);
}

async function get_event_list_by_channel(request: Request, response: Response) {
    const events = await request.event_service!.get_event_list_by_channel(request.user_id!, request.params.channel_id);
    response.status(StatusCodes.OK).json(events);
}

async function get_single_event(request: Request, response: Response) {
    let id;
    try {
        id = EventID.from_string(request.params.event_id);
    } catch {
        throw new EventNotFound(request.params.event_id);
    }

    const event = await request.event_service!.get_event(request.user_id!,id);
}



async function create_event(request: Request, response: Response) {
    const schema = Joi.object({
        name: Joi.string().required(),
        channel: Joi.string().required(),
        description: Joi.string().required(),
        start: Joi.string().required(),
        end: Joi.string().required(),
        room: Joi.string().required()
    });

    const value = validate(schema, request.body);

    const id = await request.event_service!.create_event(
        request.user_id!,value.channel,
        new Event(value.name,value.channel, value.description, value.start, value.end, value.room)
    );

    response
        .status(StatusCodes.CREATED)
        .location(`${API_VERSION}${BASE_PATH}/${id.to_string()}`)
        .end();
}

async function update_event(request: Request, response: Response) {
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
      id = EventID.from_string(request.params.event_id);
    } catch {
      throw new EventNotFound(request.params.event_id);
    }
  
    await request.event_service!.update_event(
      request.user_id!,
      id,
      value.name,
      value.details,
      value.floor
    );
  
    response.sendStatus(StatusCodes.NO_CONTENT);
}

async function delete_event(request: Request, response: Response) {
    await request.event_service!.remove_event(
      request.user_id!,
      EventID.from_string(request.params.event_id)
    );
    response.sendStatus(StatusCodes.NO_CONTENT);
}



export function init_event_routes(): express.Router{
    const router = express.Router();

    router.get(`${BASE_PATH}`, asyncHandler(get_event_list));
    router.get(`${BASE_PATH}/:event_id`, asyncHandler(get_single_event));
    router.get(`/channel/:channel_id/${BASE_PATH}`, asyncHandler(get_event_list_by_channel));
    router.post(`${BASE_PATH}`, asyncHandler(create_event));
    router.put(`${BASE_PATH}/:event_id`, asyncHandler(update_event));
    router.delete(`${BASE_PATH}/:event_id`, asyncHandler(delete_event));

    return router;
}