import { DB_NAME, DB_PASSWORD, DB_USER } from './const';
import { exec } from 'node:child_process';

const DUMP_FILENAME = 'test.dump.sql';
const CONTAINER_NAME = 'portal-postgres';
const dumpCommand = `docker exec -i ${CONTAINER_NAME} /bin/bash -c "PGPASSWORD=${DB_PASSWORD} pg_dump -Fc -U ${DB_USER} ${DB_NAME}" > ${process.cwd()}/${DUMP_FILENAME}`;
const resetCommand = `docker exec -i ${CONTAINER_NAME} /bin/bash -c "PGPASSWORD=${DB_PASSWORD} pg_restore --clean -U ${DB_USER} -d ${DB_NAME}" < ${process.cwd()}/${DUMP_FILENAME}`;

export const createDBSnapshot = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(dumpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(error.message);
        return reject(`Error creating snapshot: ${error.message}`);
      }

      if (stderr) {
        return reject(`Error output from pg_dump: ${stderr}`);
      }

      return resolve();
    });
  });
};

export const resetDBSnapshot = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(resetCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(error.message);
        return reject(`Error creating snapshot: ${error.message}`);
      }

      if (stderr) {
        return reject(`Error output from pg_dump: ${stderr}`);
      }

      return resolve();
    });
  });
};
