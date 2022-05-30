//
//
//

import { StatusCodes } from '@nextapp/common/error';
import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { Email } from '../../../domain/models/email';
import { asyncHandler, validate } from '../utils';

const BASE_PATH = '/users/me/emails';

async function add_email(request: Request, response: Response) {
  const schema = Joi.object({
    email: Joi.string().required(),
  });

  const value = validate(schema, request.body);
  const id = await request.info_service.add_email(
    request.user_id,
    Email.from_string(value.email)
  );

  response.status(StatusCodes.OK).location(`${BASE_PATH}/${id}`).end();
}

export function init_email_routes(): express.Router {
  const router = express.Router();

  router.post(BASE_PATH, asyncHandler(add_email));

  return router;
}
