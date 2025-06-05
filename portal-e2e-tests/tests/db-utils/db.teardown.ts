import { test as teardown } from '@playwright/test';
import { removeDBSnapshot } from './snapshot';

teardown('db', async () => {
  await removeDBSnapshot();
});
