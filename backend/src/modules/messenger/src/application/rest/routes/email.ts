//
//
//

import { StatusCodes } from '@nextapp/common/error';
import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { EmailNotFound } from '../../../domain/errors';
import { Email, EmailID } from '../../../domain/models/email';
import { asyncHandler, validate } from '../utils';

const BASE_PATH = '/users/me/emails';

async function add_email(request: Request, response: Response) {
  const schema = Joi.object({
    email: Joi.string().required(),
    main: Joi.boolean(),
  });

  const value = validate(schema, request.body);
  const id = await request.info_service.add_email(
    request.user_id,
    Email.from_string(value.email, value.main)
  );

  response.status(StatusCodes.OK).location(`${BASE_PATH}/${id}`).end();
}

async function delete_email(request: Request, response: Response) {
  let email_id;
  try {
    email_id = EmailID.from_string(request.params.email_id);
  } catch {
    throw new EmailNotFound(request.params.email_id);
  }

  await request.info_service.delete_email(request.user_id, email_id);
  response.sendStatus(StatusCodes.NO_CONTENT);
}

export function init_email_routes(): express.Router {
  const router = express.Router();

  router.post(BASE_PATH, asyncHandler(add_email));
  router.delete(`${BASE_PATH}/:email_id`, asyncHandler(delete_email));

  return router;
}
