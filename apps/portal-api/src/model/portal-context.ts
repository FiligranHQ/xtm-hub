import express from 'express';

import { UserLoadUserBy } from './user';

export interface PortalContext {
  user: UserLoadUserBy;
  referer?: string;
  serviceInstanceId?: string;
  req: express.Request;
  res: express.Response;
}
