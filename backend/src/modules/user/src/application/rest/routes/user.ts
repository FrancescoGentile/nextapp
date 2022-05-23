//
//
//

import { StatusCodes } from '@nextapp/common/error';
import Joi from 'joi';
import { Request, Response } from 'express-serve-static-core';
import express from 'express';
import { UserID, UserRole } from '@nextapp/common/user';
import { asyncHandler, validate, AuthMiddleware, API_VERSION } from '../utils';
import { User } from '../../../domain/models/user';
import { Username, Password } from '../../../domain/models/user.credentials';
import { SearchOptions } from '../../../domain/models/search';

const BASE_PATH = '/users';

function user_to_json(user: User) {
  return {
    self: `${API_VERSION}${BASE_PATH}/${user.id!.to_string()}`,
    username: user.username.to_string(),
    first_name: user.first_name,
    middle_name: user.middle_name,
    surname: user.surname,
    is_admin: user.role === UserRole.SYS_ADMIN,
    email: user.email.to_string(),
  };
}

async function register_user(request: Request, response: Response) {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    middle_name: Joi.string(),
    surname: Joi.string().required(),
    is_admin: Joi.boolean().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().required(),
  });

  const value = validate(schema, request.body);

  const username = Username.from_string(value.username);
  const password = await Password.from_clear(value.password, username);

  const user = new User(
    value.first_name,
    value.middle_name,
    value.surname,
    value.is_admin,
    username,
    password,
    value.email
  );
  const id = await request.user_service.register_user(request.user_id, user);

  response
    .status(StatusCodes.NO_CONTENT)
    .location(`${API_VERSION}${BASE_PATH}/${id.to_string()}`)
    .send();
}

async function get_users_list(request: Request, response: Response) {
  const schema = Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
  });
  const value = validate(schema, {
    offset: request.query.offset,
    limit: request.query.limit,
  });
  const options = SearchOptions.build(value.offset, value.limit);

  const users = await request.user_service.get_users_list(
    request.user_id,
    options
  );
  response.status(StatusCodes.OK).json(users.map(user_to_json));
}

async function change_role(request: Request, response: Response) {
  const schema = Joi.object({
    is_admin: Joi.boolean().required(),
  });

  const value = validate(schema, request.body);

  await request.user_service.change_role(
    request.user_id,
    new UserID(request.params.user_id),
    value.is_admin
  );

  response.sendStatus(StatusCodes.NO_CONTENT);
}

async function get_user_info(request: Request, response: Response) {
  const user = await request.user_service.get_user_info(
    request.user_id,
    new UserID(request.params.user_id)
  );
  response.status(StatusCodes.OK).json(user_to_json(user));
}

async function get_my_info(request: Request, response: Response) {
  const user = await request.user_service.get_user_info(
    request.user_id,
    request.user_id
  );
  response.status(StatusCodes.OK).json(user_to_json(user));
}

async function remove_user(request: Request, response: Response) {
  await request.user_service.remove_user(
    request.user_id,
    new UserID(request.params.user_id)
  );
  response.sendStatus(StatusCodes.NO_CONTENT);
}

async function delete_account(request: Request, response: Response) {
  await request.user_service.delete_account(request.user_id);
  response.sendStatus(StatusCodes.NO_CONTENT);
}

async function change_password(request: Request, response: Response) {
  const schema = Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().required(),
  });

  const value = validate(schema, request.body);

  await request.user_service.change_password(
    request.user_id,
    value.old_password,
    value.new_password
  );
  response.sendStatus(StatusCodes.NO_CONTENT);
}

export function init_user_routes(
  auth_middleware: AuthMiddleware
): express.Router {
  const router = express.Router();

  router.post(BASE_PATH, auth_middleware, asyncHandler(register_user));
  router.get(BASE_PATH, auth_middleware, asyncHandler(get_users_list));

  router.get(`${BASE_PATH}/me`, auth_middleware, asyncHandler(get_my_info));

  router.delete(
    `${BASE_PATH}/me`,
    auth_middleware,
    asyncHandler(delete_account)
  );

  router.patch(
    `${BASE_PATH}/me/password`,
    auth_middleware,
    asyncHandler(change_password)
  );

  router.get(
    `${BASE_PATH}/:user_id`,
    auth_middleware,
    asyncHandler(get_user_info)
  );

  router.patch(
    `${BASE_PATH}/:user_id`,
    auth_middleware,
    asyncHandler(change_role)
  );

  router.delete(
    `${BASE_PATH}/:user_id`,
    auth_middleware,
    asyncHandler(remove_user)
  );

  return router;
}
