import { InvalidRequestError, StatusCodes } from '@nextapp/common/error';
import Joi from 'joi';
import { toJson } from 'json-joi-converter';
import { Request, Response } from 'express-serve-static-core';
import express from 'express';
import { asyncHandler } from '../utils';
import { User } from '../../../domain/models/user';

async function register_user(request:Request, response: Response) {

  const schema = Joi.object({
    first_name: Joi.string().required(),
    middle_name: Joi.string(),
    last_name: Joi.string().required(),
    isAdmin: Joi.boolean().required(),
    username: Joi.string().required(),
    password: Joi.string().required()
  });

  const { error, value } = schema.validate(request.body);
  if (error !== undefined) {
    throw new InvalidRequestError(toJson(schema));
  }

  const requestedUser = new User(
    value.first_name,
    value.last_name,
    value.isAdmin,
    value.username,
    value.password,
    value.middle_name
  );
  const id = await request.user_service!.register_user(request.user_id, requestedUser);

  response.status(StatusCodes.CREATED).location(request.path + id.to_string());
}

export function init_user_routes(): express.Router {
  const router = express.Router();
  router.post('/users', asyncHandler(register_user));
  return router;
}