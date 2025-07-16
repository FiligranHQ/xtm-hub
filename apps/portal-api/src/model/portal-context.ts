import express from 'express';

import { Knex } from 'knex';
import { UserLoadUserBy } from './user';

export interface PortalContext {
  user: UserLoadUserBy;
  referer?: string;
  serviceInstanceId?: string;
  req: express.Request;
  res: express.Response;
  trx?: Knex.Transaction;
}
