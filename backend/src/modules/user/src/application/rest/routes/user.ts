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

  //TODO: CHECK init Username and Password

  const requestedUsername = Username.from_string(value.username);
  const requestedPassword = await Password.from_clear(value.password, requestedUsername);

  const requestedUser = new User(
    value.first_name,
    value.last_name,
    value.isAdmin,
    requestedUsername,
    requestedPassword,
    value.middle_name
  );
  
  const id = await request.user_service!.register_user(request.user_id, requestedUser);

  response.status(StatusCodes.CREATED).location(request.path + id.to_string());
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
  response.sendStatus(StatusCodes.OK);

async function get_user_info(request:Request, response: Response) {
  const user = await request.user_service!.get_user_info(request.user_id, request.params.id);
  response.status(StatusCodes.OK).json(user);
}

private function is_string(value: any): boolean {
  if (typeof (value) === 'string' || value instanceof String) {
    return true;
  }
  return false;
}


async function login(
  request: LoginRequest,
  response: Response,
) {
  try {
    const { username, password } = request.body;
    if (!is_string(username) || !is_string(password)) {
      // TODO: create specific error
      throw new Error('ciao');
    }
    auth_servive.login_with_credentials(username, password);
  } catch (error) {
    error_response(error, response);
  }
}

export function init_user_routes(): express.Router {
  const router = express.Router();
  router.post('/login', asyncHandler(login));
  router.post('/users', asyncHandler(register_user));
  router.get('/users', asyncHandler(get_user_list));
  router.get('/users/:id', asyncHandler(get_user_info));
  router.put('/users/:user_id', asyncHandler(change_role));
  
  return router;
}