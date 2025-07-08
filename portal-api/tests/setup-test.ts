import { getDbTestConnection } from './config-test';

function isUtilOrHelper(filepath) {
  return /\b(util|utils|helper|helpers|pure|mock|stub|constant|constants|types)\b/i.test(
    filepath
  );
}
beforeAll(async (suite) => {
  const currentFile = suite?.file?.name;

  if (isUtilOrHelper(currentFile)) {
    console.log('⚠️ Did not clean', currentFile);
    return;
  }
  console.log('🧹 Clean up DB', currentFile);
  const db = getDbTestConnection();
  await db.raw('DROP SCHEMA public CASCADE;');
  await db.raw('CREATE SCHEMA public');
  await db.raw('GRANT ALL ON SCHEMA public TO public');
  await db.migrate.latest();
  await db.seed.run();
});
