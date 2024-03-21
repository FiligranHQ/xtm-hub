import express from 'express';
import { User } from './user';

export interface PortalContext {
  user: User;
  referer?: string;
  req: express.Request;
  res: express.Response;
}
