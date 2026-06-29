import express from 'express';

import type { DocumentDataLoaders } from '../modules/document/document.dataloader';
import { UserLoadUserBy } from './user';

export interface PortalContext {
  user: UserLoadUserBy;
  referer?: string;
  req: express.Request;
  res: express.Response;
  dataLoaders: DocumentDataLoaders;
}
