//
//
//

import { StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import express from 'express';
import { DateTime } from 'luxon';
import { Room, RoomID } from '../../../domain/models/room';
import { API_VERSION, asyncHandler, validate } from '../utils';
import { SearchOptions } from '../../../domain/models/search';
import { RoomNotFound } from '../../../domain/errors';

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

async function get_floors(request: Request, response: Response) {
  const floors = await request.room_service!.get_floors();
  response.status(StatusCodes.OK).json(floors);
}

async function get_room(request: Request, response: Response) {
  let id;
  try {
    id = RoomID.from_string(request.params.room_id);
  } catch {
    throw new RoomNotFound(request.params.room_id);
  }

  const room = await request.room_service!.get_room(id);
  response.status(StatusCodes.OK).json(room_to_json(room));
}

async function search_rooms(request: Request, response: Response) {
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
    floor: Joi.number(),
    start: Joi.date(),
    end: Joi.date(),
  }).with('start', 'end');

  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
    floor: request.query.floor,
    start: request.query.start,
    end: request.query.end,
  });

  let interval;
  if (value.start !== undefined) {
    interval = {
      start: DateTime.fromJSDate(value.start),
      end: DateTime.fromJSDate(value.end),
    };
  }

  const rooms = await request.room_service!.search_rooms(
    SearchOptions.build(value.offset, value.limit),
    value.floor,
    interval
  );

  response.status(StatusCodes.OK).json(rooms.map(room_to_json));
}

async function get_slots(request: Request, response: Response) {
  const schema = Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
  });

  const value = validate(schema, {
    start: request.query.start,
    end: request.query.end,
  });

  const slots = await request.room_service!.get_available_slots(
    RoomID.from_string(request.params.room_id),
    DateTime.fromJSDate(value.start),
    DateTime.fromJSDate(value.end)
  );

  response.status(StatusCodes.OK).json(
    slots.map((slot) => ({
      interval: slot.interval.interval.toISO(),
      seats: slot.seats,
    }))
  );
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

  const value = validate(schema, request.body);

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

  router.get(`/floors`, asyncHandler(get_floors));
  router.get(`${BASE_PATH}/:room_id`, asyncHandler(get_room));
  router.get(`${BASE_PATH}/:room_id/slots`, asyncHandler(get_slots));
  router.get(BASE_PATH, asyncHandler(search_rooms));
  router.post(BASE_PATH, asyncHandler(create_room));
  // router.patch(`${BASE_PATH}/:room_id`, asyncHandler(modify_room));
  router.delete(`${BASE_PATH}/:room_id`, asyncHandler(delete_room));

  return router;
}
