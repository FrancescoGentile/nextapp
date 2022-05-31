//
//
//

import { StatusCodes } from '@nextapp/common/error';
import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { DateTime } from 'luxon';
import { DeviceNotFound } from '../../../domain/errors';
import {
  FCMToken,
  WebDeviceFingerprint,
  WebDeviceID,
} from '../../../domain/models/device';
import { asyncHandler, validate } from '../utils';

const BASE_PATH = '/users/me/devices';

function id_to_self(id: WebDeviceID): string {
  return `${BASE_PATH}/${id.to_string()}`;
}

async function add_device(request: Request, response: Response) {
  const schema = Joi.object({
    token: Joi.string().required(),
    fingerptint: Joi.string(),
    name: Joi.string().required(),
  });

  const value = validate(schema, request.body);
  const id = await request.info_service.add_device(request.user_id, {
    token: new FCMToken(value.token),
    fingerprint: new WebDeviceFingerprint(value.fingerprint),
    name: value.name,
    timestamp: DateTime.utc(),
  });

  response.status(StatusCodes.OK).location(id_to_self(id)).end();
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

  router.post(BASE_PATH, asyncHandler(add_device));
  router.post(`${BASE_PATH}/:device_id`, asyncHandler(delete_device));

  return router;
}
