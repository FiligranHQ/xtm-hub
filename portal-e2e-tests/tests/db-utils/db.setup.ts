import { test as setup } from '@playwright/test';
import { createDBSnapshot } from './snapshot';

setup('db', async () => {
  await createDBSnapshot();
});
