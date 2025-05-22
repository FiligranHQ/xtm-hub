export const PLATFORM_ORGANIZATION_UUID =
  'ba091095-418f-4b4f-b150-6c9295e232c4';

export const ADMIN_PASSWORD_HASH =
  'a0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e';
export const ADMIN_PASSWORD_SALT = 'fabc28ed1339f8b34c10bc3b5a650c01';

export const DB_USER = process.env.E2E_BASE_URL
  ? process.env.POSTGRES_USER
  : 'portal';

export const DB_NAME = process.env.E2E_BASE_URL
  ? process.env.POSTGRES_DB
  : 'test_database';

export const DB_PASSWORD = process.env.E2E_BASE_URL
  ? process.env.POSTGRES_PASSWORD
  : 'portal-password';
