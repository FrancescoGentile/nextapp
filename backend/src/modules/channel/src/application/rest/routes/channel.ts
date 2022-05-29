//
//
//

import { StatusCodes } from '@nextapp/common/error';
import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import express from 'express';
import { DateTime } from 'luxon';
import { API_VERSION, asyncHandler, validate } from '../utils';

const BASE_PATH = '/rooms';

export function init_channel_routes(): express.Router {
  const router = express.Router();



  return router;
}
