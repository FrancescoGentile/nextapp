//
//
//

import { StatusCodes } from '@nextapp/common/error';
import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { DateTime } from 'luxon';
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

export function init_device_routes(): express.Router {
  const router = express.Router();

  router.post(BASE_PATH, asyncHandler(add_device));

  return router;
}
