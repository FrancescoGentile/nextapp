//
//
//

import { StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import express from 'express';
import { DateTime } from 'luxon';
import { asyncHandler, validate } from '../utils';
import {
  ChannelNotFound,
  EventNotFound,
  InvalidEventID,
  InvalidEventRoomID,
  ParticipationNotFound,
} from '../../../domain/errors';
import { SearchOptions } from '../../../domain/models/search';
import { ChannelID } from '../../../domain/models/channel';
import { EventID, Event, RoomID } from '../../../domain/models/event';
import {
  Participation,
  ParticipationID,
} from '../../../domain/models/participation';

function id_to_self(id: EventID): string {
  return `event/${id.to_string()}`;
}

function event_to_json(event: Event): any {
  return {
    self: id_to_self(event.id!),
    channel: {
      self: `/channels/${event.channel.to_string()}`,
    },
    room: {
      self: `/rooms/${event.room.to_string()}`,
    },
    start: event.interval.start.toISO(),
    end: event.interval.end.toISO(),
    name: event.name,
    description: event.description,
  };
}

async function get_event(request: Request, response: Response) {
  let id;
  try {
    id = EventID.from_string(request.params.event_id);
  } catch {
    throw new EventNotFound(request.params.event_id);
  }

  const event = await request.event_service.get_event(request.user_id, id);
  response.status(StatusCodes.OK).json(event_to_json(event));
}

async function get_channel_events(request: Request, response: Response) {
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
    past: Joi.boolean(),
  });
  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
    past: request.query.past,
  });
  const options = SearchOptions.build(value.offset, value.limit);

  let channel_id: ChannelID;
  try {
    channel_id = ChannelID.from_string(request.params.channel_id);
  } catch {
    throw new ChannelNotFound(request.params.channel_id);
  }

  const events = await request.event_service.get_channel_events(
    request.user_id,
    channel_id,
    options,
    value.past || false
  );
  response.status(StatusCodes.OK).json(events.map(event_to_json));
}

async function create_event(request: Request, response: Response) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    room: Joi.object({
      self: Joi.string().required(),
    }).required(),
    start: Joi.date().required(),
    end: Joi.date().required(),
  });

  const value = validate(schema, request.body);

  let channel_id: ChannelID;
  try {
    channel_id = ChannelID.from_string(request.query.channel_id);
  } catch {
    throw new ChannelNotFound(request.query.channel_id);
  }

  const path = value.room.self;
  const regex = /^\/rooms\/(.*)$/;
  const match = path.match(regex);

  if (match === null) {
    throw new InvalidEventRoomID(path);
  }

  await request.event_service.create_event(
    request.user_id,
    channel_id,
    value.name,
    value.description,
    new RoomID(match[1]),
    DateTime.fromJSDate(value.start),
    DateTime.fromJSDate(value.end)
  );

  response.sendStatus(StatusCodes.ACCEPTED);
}

async function update_event(request: Request, response: Response) {
  const schema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
  });

  const value = validate(schema, request.body);

  let id;
  try {
    id = EventID.from_string(request.params.event_id);
  } catch {
    throw new EventNotFound(request.params.event_id);
  }

  await request.event_service.update_event(
    request.user_id!,
    id,
    value.name,
    value.description
  );

  response.sendStatus(StatusCodes.NO_CONTENT);
}

async function delete_event(request: Request, response: Response) {
  let id: EventID;
  try {
    id = EventID.from_string(request.params.event_id);
  } catch {
    throw new EventNotFound(request.params.event_id);
  }

  await request.event_service.delete_event(request.user_id!, id);
  response.sendStatus(StatusCodes.NO_CONTENT);
}

// -----------------------------------------------------------

function participation_to_json(part: Participation): any {
  return {
    self: `/users/me/participations/${part.id!.to_string()}`,
    participant: {
      self: '/users/me',
    },
    event: {
      self: `/events/${part.event_id.to_string()}`,
    },
  };
}

async function get_participants(request: Request, response: Response) {
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
  });
  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
  });
  const options = SearchOptions.build(value.offset, value.limit);

  let id: EventID;
  try {
    id = EventID.from_string(request.params.event_id);
  } catch {
    throw new EventNotFound(request.params.event_id);
  }

  const users = await request.event_service.get_participants(
    request.user_id!,
    id,
    options
  );

  response.status(StatusCodes.OK).json(
    users.map((user_id) => ({
      self: `/users/${user_id.to_string()}`,
    }))
  );
}

async function get_my_participations(request: Request, response: Response) {
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
    past: Joi.boolean(),
  });
  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
    past: request.query.past,
  });
  const options = SearchOptions.build(value.offset, value.limit);

  const parts = await request.event_service.get_user_participations(
    request.user_id,
    options,
    value.past || false
  );

  response.status(StatusCodes.OK).json(parts.map(participation_to_json));
}

async function get_my_participation(request: Request, response: Response) {
  let part_id: ParticipationID;
  try {
    part_id = ParticipationID.from_string(request.params.partecipation_id);
  } catch {
    throw new ParticipationNotFound(request.params.participation_id);
  }

  const part = await request.event_service.get_user_participation(
    request.user_id,
    part_id
  );

  response.status(StatusCodes.OK).json(participation_to_json(part));
}

async function add_participation(request: Request, response: Response) {
  const schema = Joi.object({
    event: Joi.object({
      self: Joi.string().required(),
    }).required(),
  });

  const value = validate(schema, request.body);

  const path = value.event.self;
  const regex = /^\/events\/(.*)$/;
  const match = path.match(regex);

  if (match === null) {
    throw new InvalidEventID('');
  }
  let event_id: EventID;
  try {
    event_id = EventID.from_string(match[1]);
  } catch {
    throw new InvalidEventID(match[1]);
  }

  const id = await request.event_service.add_participation(
    request.user_id,
    event_id
  );

  response
    .status(StatusCodes.CREATED)
    .location(`/users/me/participations/${id.to_string()}`)
    .end();
}

async function delete_participation(request: Request, response: Response) {
  let part_id: ParticipationID;
  try {
    part_id = ParticipationID.from_string(request.params.partecipation_id);
  } catch {
    throw new ParticipationNotFound(request.params.participation_id);
  }

  await request.event_service.delete_participation(request.user_id, part_id);

  response.sendStatus(StatusCodes.NO_CONTENT);
}

export function init_news_routes(): express.Router {
  const router = express.Router();

  router.get('/events/:event_id', asyncHandler(get_event));
  router.get('/channels/:channel_id/events', asyncHandler(get_channel_events));
  router.post('/channels/:channel_id/events', asyncHandler(create_event));
  router.patch('/events/:event_id', asyncHandler(update_event));
  router.delete('/events/:event_id', asyncHandler(delete_event));

  router.get('/events/:event_id/participants', asyncHandler(get_participants));
  router.get('/users/me/participations/', asyncHandler(get_my_participations));
  router.get(
    '/users/me/participations/:participation_id',
    asyncHandler(get_my_participation)
  );
  router.post('/users/me/participations', asyncHandler(add_participation));
  router.delete(
    '/users/me/participations/participation_id',
    asyncHandler(delete_participation)
  );

  return router;
}
