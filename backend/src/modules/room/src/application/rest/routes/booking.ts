//
//
//

import { StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import express from 'express';

import { DateTime } from 'luxon';
import { RoomID } from '../../../domain/models/room';
import { API_VERSION, asyncHandler, validate } from '../utils';
import { Booking, BookingID } from '../../../domain/models/booking';
import { SearchOptions } from '../../../domain/models/search';
import { BookingNotFound, InvalidBookingRoom } from '../../../domain/errors';

const BASE_PATH = '/users/me/bookings';

function booking_to_json(booking: Booking): any {
  return {
    self: `${API_VERSION}${BASE_PATH}/${booking.id!.to_string()}`,
    room: {
      self: `${API_VERSION}/rooms/${booking.room.to_string()}`,
    },
    start: booking.interval.interval.start.toString(),
    end: booking.interval.interval.end.toString(),
  };
}

async function get_booking(request: Request, response: Response) {
  let id;
  try {
    id = BookingID.from_string(request.params.booking_id);
  } catch {
    throw new BookingNotFound(request.params.booking_id);
  }
  const booking = await request.booking_service!.get_booking(
    request.user_id!,
    id
  );
  response.status(StatusCodes.OK).json(booking_to_json(booking));
}

async function search_bookings(request: Request, response: Response) {
  const schema = Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
    offset: Joi.number(),
    limit: Joi.number(),
  });

  const value = validate(schema, {
    start: request.query.start,
    end: request.query.end,
    offset: request.query.offset,
    limit: request.query.limit,
  });

  const options = SearchOptions.build(value.offset, value.limit);

  const bookings = await request.booking_service!.search_bookings(
    request.user_id!,
    DateTime.fromJSDate(value.start),
    DateTime.fromJSDate(value.end),
    options
  );

  response.status(StatusCodes.OK).json(bookings.map(booking_to_json));
}

async function create_booking(request: Request, response: Response) {
  // In theory, we could put more constraints on the request properties.
  // However, the business logic is responsible for the validatiom.
  const schema = Joi.object({
    room: Joi.object({
      self: Joi.string().required(),
    }).required(),
    start: Joi.date().required(),
    end: Joi.date().required(),
  });

  const value = validate(schema, request.body);

  const path = value.room.self;
  const regex = /^\/api\/v1\/rooms\/(.*)$/;
  const match = path.match(regex);

  if (match === null) {
    throw new InvalidBookingRoom();
  }
  let room_id;
  try {
    room_id = RoomID.from_string(match[1]);
  } catch {
    throw new InvalidBookingRoom();
  }

  const id = await request.booking_service!.create_booking(
    request.user_id!,
    room_id,
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
  router.get(BASE_PATH, asyncHandler(search_bookings));
  router.post(BASE_PATH, asyncHandler(create_booking));
  router.delete(`${BASE_PATH}/:booking_id`, asyncHandler(delete_booking));

  return router;
}
