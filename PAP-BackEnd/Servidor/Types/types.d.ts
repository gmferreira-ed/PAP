

import type { Request as Req, Response as Res, NextFunction } from 'express';

declare global {
  type ExpressRequest = Req;
  type ExpressResponse = Res;

  type AsyncEndpoint = (
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => Promise<any>;

  type PermissionsMiddleware = (
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => Promise<any>;
}