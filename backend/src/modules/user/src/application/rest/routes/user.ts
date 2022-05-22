import { InvalidRequestError, StatusCodes } from '@nextapp/common/error';
import Joi from 'joi';
import { toJson } from 'json-joi-converter';
import { 
  Request, 
  Response, 
  LoginRequest 
} from 'express-serve-static-core';
import express from 'express';
import { asyncHandler } from '../utils';
import { User } from '../../../domain/models/user';
import { 
  Username,
  Password
} from '../../../domain/models/user.credentials'
import { InvalidCredentials } from '../../../domain/errors/errors.index';

async function register_user(request:Request, response: Response) {

  const schema = Joi.object({
    first_name: Joi.string().required(),
    middle_name: Joi.string(),
    last_name: Joi.string().required(),
    isAdmin: Joi.boolean().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().required(),
  });

  const { error, value } = schema.validate(request.body);
  if (error !== undefined) {
    throw new InvalidRequestError(toJson(schema));
  }

  //TODO: CHECK init Username and Password

  const requestedUsername = Username.from_string(value.username);
  const requestedPassword = await Password.from_clear(value.password, requestedUsername);

  const requestedUser = new User(
    value.first_name,
    value.last_name,
    value.isAdmin,
    requestedUsername,
    requestedPassword,
    value.email,
    value.middle_name
  );
  const id = await request.user_service!.register_user(request.user_id, requestedUser);
  response
    .status(StatusCodes.NO_CONTENT)
    .location(request.path + id.to_string()
  );
}


async function get_user_list(request: Request, response: Response) {
  const users = await request.user_service!.get_user_list(request.user_id);
  response.status(StatusCodes.OK).json(users);
}

async function change_role(request:Request, response: Response) {
  await request.user_service!.change_role(
    request.user_id,
    request.params.user_id,
    request.params.role
  );
  response.sendStatus(StatusCodes.NO_CONTENT);
}

async function get_user_info(request:Request, response: Response) {
  const user = await request.user_service!.get_user_info(
    request.user_id, 
    request.params.id
  );
  response.status(StatusCodes.OK).json(user);
}

function is_string(value: any): boolean {
  if (typeof (value) === 'string' || value instanceof String) {
    return true;
  }
  return false;
}

async function login(
  request: LoginRequest,
  response: Response,
) {
  const username = request.params.username;
  const password = request.params.password;
    if (!is_string(username) || !is_string(password)) {
      throw new InvalidCredentials();
    }
  const token = await request.auth_service.login_with_credentials(username, password);
  
  response.cookie(
    'JsonWebToken', 
    token.to_string(), 
    { secure: true, httpOnly: true }
  );
  response.status(StatusCodes.NO_CONTENT);
}

async function ban_user(request:Request, response: Response) {
  await request.user_service!.ban_user(request.user_id, request.params.id);
  response.status(StatusCodes.NO_CONTENT);
}

async function unsubscribe(request: Request, response: Response){
  await request.user_service!.unsubscribe(request.user_id);
  response
    .status(StatusCodes.NO_CONTENT);
}

async function change_password(request:Request, response: Response) {
  await request.user_service!.change_password(
    request.params.username,
    request.params.old_password,
    request.params.new_password
  );
  response.sendStatus(StatusCodes.NO_CONTENT);
}

export function init_user_routes(): express.Router {
  const router = express.Router();
  router.post('/login', asyncHandler(login));

  router.post('/users', asyncHandler(register_user));
  router.get('/users', asyncHandler(get_user_list));

  router.get('/users/:id', asyncHandler(get_user_info));
  router.put('/users/:id', asyncHandler(change_role));
  router.delete('/users/:id', asyncHandler(ban_user));

  router.delete('/users/me'), asyncHandler(unsubscribe);

  router.put('/user/me/password', asyncHandler(change_password));

  return router;
}