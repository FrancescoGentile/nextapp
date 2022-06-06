//
//
//

import { StatusCodes } from '@nextapp/common/error';
import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { DateTime } from 'luxon';
import { NotificationToken } from '../../../domain/models/notification';
import { DeviceNotFound } from '../../../domain/errors';
import {
  WebDevice,
  WebDeviceFingerprint,
  WebDeviceID,
} from '../../../domain/models/device';
import { SearchOptions } from '../../../domain/models/search';
import { asyncHandler, validate } from '../utils';

const BASE_PATH = '/users/me/devices';

function id_to_self(id: WebDeviceID): string {
  return `${BASE_PATH}/${id.to_string()}`;
}

function device_to_json(device: WebDevice) {
  return {
    self: id_to_self(device.id!),
    name: device.name,
    fingerprint: device.fingerprint?.to_string() || undefined,
    token: device.token.to_string(),
    timestamp: device.timestamp.toString(),
  };
}

async function get_device(request: Request, response: Response) {
  let device_id;
  try {
    device_id = WebDeviceID.from_string(request.params.device_id);
  } catch {
    throw new DeviceNotFound(request.params.device_id);
  }

  const device = await request.info_service.get_device(
    request.user_id,
    device_id
  );
  response.status(StatusCodes.OK).json(device_to_json(device));
}

async function get_devices(request: Request, response: Response) {
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
  });

  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
  });

  const options = SearchOptions.build(value.offset, value.limit);
  const devices = await request.info_service.get_devices(
    request.user_id,
    options
  );

  response.status(StatusCodes.OK).json(devices.map(device_to_json));
}

async function add_device(request: Request, response: Response) {
  const schema = Joi.object({
    token: Joi.string().required(),
    fingerprint: Joi.string(),
    name: Joi.string().required(),
  });

  const value = validate(schema, request.body);
  const id = await request.info_service.add_device(request.user_id, {
    token: new NotificationToken(value.token),
    fingerprint: new WebDeviceFingerprint(value.fingerprint),
    name: value.name,
    timestamp: DateTime.utc(),
  });

  response.status(StatusCodes.CREATED).location(id_to_self(id)).end();
}

async function delete_device(request: Request, response: Response) {
  let device_id;
  try {
    device_id = WebDeviceID.from_string(request.params.device_id);
  } catch {
    throw new DeviceNotFound(request.params.device_id);
  }

  await request.info_service.delete_device(request.user_id, device_id);
  response.sendStatus(StatusCodes.NO_CONTENT);
}

export function init_device_routes(): express.Router {
  const router = express.Router();

  router.get(`${BASE_PATH}/:device_id`, asyncHandler(get_device));
  router.get(BASE_PATH, asyncHandler(get_devices));
  router.post(BASE_PATH, asyncHandler(add_device));
  router.delete(`${BASE_PATH}/:device_id`, asyncHandler(delete_device));

  return router;
}
