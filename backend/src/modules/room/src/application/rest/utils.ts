//
//
//

import { NextFunction, Request, Response } from 'express-serve-static-core';

export const API_VERSION = '/api/v1';

export const asyncHandler =
  (fn: any) => (req: Request, res: Response, next?: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
