import express from 'express';

import { UserLoadUserBy } from './user';

export interface PortalContext {
  user: UserLoadUserBy;
  referer?: string;
  req: express.Request;
  res: express.Response;
}
