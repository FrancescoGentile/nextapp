//
//
//

import { InvalidRequestError, StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { toJson } from 'json-joi-converter';
import express from 'express';
import { RoomNotFound } from '../../../domain/errors';
import { Room, RoomID } from '../../../domain/models/room';
import { API_VERSION, asyncHandler } from '../utils';

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

async function get_rooms(request: Request, response: Response) {
  const schema = Joi.array().items(Joi.string());
  const { error, value } = schema.validate(request.query.id);
  if (error !== undefined) {
    throw new InvalidRequestError(toJson(schema));
  }

  const ids: RoomID[] = value.map((id: string) => RoomID.from_string(id));
  const rooms = await request.room_service!.get_rooms(ids);
  response.status(StatusCodes.OK).json(rooms.map(room_to_json));
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
  router.get(BASE_PATH, asyncHandler(get_rooms));
  router.post(BASE_PATH, asyncHandler(create_room));
  router.delete(`${BASE_PATH}/:room_id`, asyncHandler(delete_room));

  return router;
}
