//
//
//

import { StatusCodes } from '@nextapp/common/error';
import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { EmailNotFound } from '../../../domain/errors';
import { EmailAddress, EmailID } from '../../../domain/models/email';
import { SearchOptions } from '../../../domain/models/search';
import { asyncHandler, validate } from '../utils';

const BASE_PATH = '/users/me/emails';

function id_to_self(id: EmailID): string {
  return `${BASE_PATH}/${id.to_string()}`;
}

function email_to_json(email: EmailAddress) {
  return {
    self: id_to_self(email.id!),
    main: email.main,
    email: email.to_string(),
  };
}

async function get_email(request: Request, response: Response) {
  let email_id;
  try {
    email_id = EmailID.from_string(request.params.email_id);
  } catch {
    throw new EmailNotFound(request.params.email_id);
  }

  const email = await request.info_service.get_email(request.user_id, email_id);
  response.status(StatusCodes.OK).json(email_to_json(email));
}

async function get_emails(request: Request, response: Response) {
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
  });

  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
  });

  const options = SearchOptions.build(value.offset, value.limit);
  const emails = await request.info_service.get_emails(
    request.user_id,
    options
  );

  response.status(StatusCodes.OK).json(emails.map(email_to_json));
}

async function add_email(request: Request, response: Response) {
  const schema = Joi.object({
    email: Joi.string().required(),
    main: Joi.boolean(),
  });

  const value = validate(schema, request.body);
  const id = await request.info_service.add_email(
    request.user_id,
    EmailAddress.from_string(value.email, value.main)
  );

  response.status(StatusCodes.OK).location(id_to_self(id)).end();
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

  router.get(`${BASE_PATH}/:email_id`, asyncHandler(get_email));
  router.get(BASE_PATH, asyncHandler(get_emails));
  router.post(BASE_PATH, asyncHandler(add_email));
  router.delete(`${BASE_PATH}/:email_id`, asyncHandler(delete_email));

  return router;
}
