import { resetDBSnapshot } from '../db-utils/snapshot';

export const afterEach = async () => {
  await resetDBSnapshot();
};
