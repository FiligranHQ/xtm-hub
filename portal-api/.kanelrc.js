/** @type {import('kanel').Config} */
module.exports = {
  connection: {
    'host': '127.0.0.1',
    'port': 5432,
    'user': 'portal',
    'password': 'portal-password',
    'database': 'cloud-portal',
  },

  preDeleteOutputFolder: true,
  outputPath: './src/model/kanel',

  customTypeMap: {
    'pg_catalog.tsvector': 'string',
    'pg_catalog.bpchar': 'string',
  },
};
