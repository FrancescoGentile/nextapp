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
import { RoomID } from '../../../domain/models/room';
import { API_VERSION, asyncHandler } from '../utils';
import { Booking, BookingID } from '../../../domain/models/booking';
import { SearchOptions } from '../../../domain/models/search';

const BASE_PATH = '/users/me/bookings';

function booking_to_json(booking: Booking): any {
  return {
    self: `${API_VERSION}${BASE_PATH}/${booking.id!.to_string()}`,
    room: `${API_VERSION}/rooms/${booking.room.to_string()}`,
    start: booking.interval.interval.start.toString(),
    end: booking.interval.interval.end.toString(),
  };
}

async function get_booking(request: Request, response: Response) {
  const id = BookingID.from_string(request.params.booking_id);
  const bookings = await request.booking_service!.get_bookings(
    request.user_id!,
    [id]
  );

  if (bookings.length === 0) {
    throw new RoomNotFound(id.to_string());
  }
  response.status(StatusCodes.OK).json(booking_to_json(bookings[0]));
}

async function search_bookings(request: Request, response: Response) {
  const { offset, limit } = request.query;
  const off = offset !== undefined ? offset : SearchOptions.DEFAULT_OFFSET;
  const lim = limit !== undefined ? limit : SearchOptions.DEFAULT_LIMIT;

  const options = SearchOptions.build(off, lim);
  const bookings = await request.booking_service!.search_bookings(
    request.user_id!,
    options
  );

  response
    .status(StatusCodes.OK)
    .json(bookings.map((id) => `${API_VERSION}${BASE_PATH}/${id.to_string()}`));
}

async function get_bookings(
  request: Request,
  response: Response,
  next?: NextFunction
) {
  if (request.query.id === undefined) {
    // user did not specify any ids
    next!();
  } else {
    // user specified at least one id
    const schema = Joi.array().items(Joi.string());
    const { error, value } = schema.validate(request.query.id);
    if (error !== undefined) {
      throw new InvalidRequestError(toJson(schema));
    }

    const ids: BookingID[] = value.map((id: string) =>
      BookingID.from_string(id)
    );
    const bookings = await request.booking_service!.get_bookings(
      request.user_id!,
      ids
    );
    response.status(StatusCodes.OK).json(bookings.map(booking_to_json));
  }
}

async function create_booking(request: Request, response: Response) {
  // In theory, we could put more constraints on the request properties.
  // However, the business logic is responsible for the validatiom.
  const schema = Joi.object({
    room_id: Joi.string().required(),
    start: Joi.date().required(),
    end: Joi.date().required(),
  });

  const { error, value } = schema.validate(request.body);
  if (error !== undefined) {
    throw new InvalidRequestError(toJson(schema));
  }

  const id = await request.booking_service!.create_booking(
    request.user_id!,
    RoomID.from_string(value.room_id),
    DateTime.fromJSDate(value.start),
    DateTime.fromJSDate(value.end)
  );

  response
    .status(StatusCodes.CREATED)
    .location(`${API_VERSION}/users/me/bookings/${id.to_string()}`)
    .send();
}

async function delete_booking(request: Request, response: Response) {
  await request.booking_service!.delete_booking(
    request.user_id!,
    BookingID.from_string(request.params.booking_id)
  );
  response.sendStatus(StatusCodes.NO_CONTENT);
}

export function init_booking_routes(): express.Router {
  const router = express.Router();

  router.get(`${BASE_PATH}/:booking_id`, asyncHandler(get_booking));
  router.get(
    BASE_PATH,
    asyncHandler(get_bookings),
    asyncHandler(search_bookings)
  );
  router.post(BASE_PATH, asyncHandler(create_booking));
  router.delete(`${BASE_PATH}/:booking_id`, asyncHandler(delete_booking));

  return router;
}
