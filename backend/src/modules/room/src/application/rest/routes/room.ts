//
//
//

import { InvalidRequestError, StatusCodes } from '@nextapp/common/error';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { toJson } from 'json-joi-converter';
import express from 'express';
import { DateTime } from 'luxon';
import { RoomNotFound } from '../../../domain/errors';
import { Room, RoomID } from '../../../domain/models/room';
import { API_VERSION, asyncHandler } from '../utils';
import { SearchOptions } from '../../../domain/models/search';

const BASE_PATH = '/rooms';

function room_to_json(room: Room): any {
  return {
    self: `${API_VERSION}${BASE_PATH}/${room.id!.to_string()}`,
    name: room.name,
    details: room.details,
    seats: room.seats,
    floor: room.floor,
  };
}

async function get_room(request: Request, response: Response) {
  const id = RoomID.from_string(request.params.room_id);
  const rooms = await request.room_service!.get_rooms([id]);
  if (rooms.length === 0) {
    throw new RoomNotFound(id.to_string());
  }
  response.status(StatusCodes.OK).json(room_to_json(rooms[0]));
}

async function get_rooms(
  request: Request,
  response: Response,
  next?: NextFunction
) {
  if (request.query.id === undefined) {
    next!();
  } else {
    const schema = Joi.array().items(Joi.string());
    const { error, value } = schema.validate(request.query.id);
    if (error !== undefined) {
      throw new InvalidRequestError(toJson(schema));
    }

    const ids: RoomID[] = value.map((id: string) => RoomID.from_string(id));
    const rooms = await request.room_service!.get_rooms(ids);
    response.status(StatusCodes.OK).json(rooms.map(room_to_json));
  }
}

async function search_rooms(request: Request, response: Response) {
  const { offset, limit } = request.query;
  const off = offset ?? SearchOptions.DEFAULT_OFFSET;
  const lim = limit ?? SearchOptions.DEFAULT_LIMIT;
  const options = SearchOptions.build(off, lim);

  let ids;
  if (request.query.floor !== undefined) {
    ids = await request.room_service!.search_rooms_by_floor(
      Number.parseFloat(request.query.floor),
      options
    );
  } else if (
    request.query.start !== undefined ||
    request.query.end !== undefined
  ) {
    const schema = Joi.object({
      start: Joi.date().required(),
      end: Joi.date().required(),
    });
    const { error, value } = schema.validate({
      start: request.query.start,
      end: request.query.end,
    });

    if (error !== undefined) {
      throw new InvalidRequestError(toJson(schema));
    }
    ids = await request.room_service!.search_rooms_by_availability(
      DateTime.fromJSDate(value.start),
      DateTime.fromJSDate(value.end),
      options
    );
  } else {
    ids = await request.room_service!.search_rooms(options);
  }

  response
    .status(StatusCodes.OK)
    .json(ids.map((id) => `${API_VERSION}${BASE_PATH}/${id.to_string()}`));
}

async function get_slots(request: Request, response: Response) {
  const schema = Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
  });
  const { error, value } = schema.validate({
    start: request.query.start,
    end: request.query.end,
  });

  if (error !== undefined) {
    throw new InvalidRequestError(toJson(schema));
  }

  const slots = await request.room_service!.get_available_slots(
    RoomID.from_string(request.params.room_id),
    DateTime.fromJSDate(value.start),
    DateTime.fromJSDate(value.end)
  );

  response
    .status(StatusCodes.OK)
    .json(slots.map((slot) => slot.interval.toISO()));
}

async function create_room(request: Request, response: Response) {
  // In theory, we could put more constraints on the request properties.
  // However, the business logic is responsible for the validatiom.
  const schema = Joi.object({
    name: Joi.string().required(),
    details: Joi.any(),
    seats: Joi.number().required(),
    floor: Joi.number().required(),
  });

  const { error, value } = schema.validate(request.body);
  if (error !== undefined) {
    throw new InvalidRequestError(toJson(schema));
  }

  const id = await request.room_service!.create_room(
    request.user_id!,
    new Room(value.name, value.details, value.seats, value.floor)
  );

  response
    .status(StatusCodes.CREATED)
    .location(`${API_VERSION}${BASE_PATH}/${id.to_string()}`)
    .send();
}

async function delete_room(request: Request, response: Response) {
  await request.room_service!.delete_room(
    request.user_id!,
    RoomID.from_string(request.params.room_id)
  );
  response.sendStatus(StatusCodes.NO_CONTENT);
}

export function init_room_routes(): express.Router {
  const router = express.Router();

  router.get(`${BASE_PATH}/:room_id`, asyncHandler(get_room));
  router.get(`${BASE_PATH}/:room_id/slots`, asyncHandler(get_slots));
  router.get(BASE_PATH, asyncHandler(get_rooms), asyncHandler(search_rooms));
  router.post(BASE_PATH, asyncHandler(create_room));
  router.delete(`${BASE_PATH}/:room_id`, asyncHandler(delete_room));

  return router;
}
