import express from 'express';
import { UserLoadUserBy } from './load-user-by';

export interface PortalContext {
  user: UserLoadUserBy;
  referer?: string;
  req: express.Request;
  res: express.Response;
}
