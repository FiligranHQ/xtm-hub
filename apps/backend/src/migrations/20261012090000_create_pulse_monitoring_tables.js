// Threat Pulse monitoring, read by the Hub administrators only: counts per UTC
// day, never a key, a hash or a raw value.
// - PulsePlatformDailyIngestion: the batches and records a platform pushed; it
//   leaves with the platform (purge, retention) like its daily totals.
// - PulseRejection: the requests refused per operation and error code, with
//   nothing about the caller.
// - PulsePurgeRequest: the purges a platform pseudonym requested; it outlives
//   the purge and leaves with the retention period.

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  if (!(await knex.schema.hasTable('PulsePlatformDailyIngestion'))) {
    await knex.schema.createTable('PulsePlatformDailyIngestion', (table) => {
      table
        .integer('pulse_platform_id')
        .notNullable()
        .references('id')
        .inTable('PulsePlatform')
        .onDelete('CASCADE');
      table.date('day').notNullable();
      table.integer('batch_count').notNullable();
      table.bigInteger('record_count').notNullable();
      table.timestamp('last_batch_at');
      table.primary(['pulse_platform_id', 'day']);
    });
    // The days pushed before this table: the ledger rows of each day, a lower
    // bound of the records, and the batch receipts still held (3 days).
    await knex.raw(`
      INSERT INTO "PulsePlatformDailyIngestion" (pulse_platform_id, day, batch_count, record_count)
      SELECT c.pulse_platform_id, c.day, COALESCE(b.batches, 0), c.records
      FROM (
        SELECT pulse_platform_id, day, COUNT(*) AS records
        FROM "PulseContribution"
        GROUP BY pulse_platform_id, day
      ) c
      JOIN "PulsePlatform" p ON p.id = c.pulse_platform_id
      LEFT JOIN (
        SELECT pseudonym, day, COUNT(*)::int AS batches
        FROM "PulseBatch"
        WHERE accepted > 0
        GROUP BY pseudonym, day
      ) b ON b.pseudonym = p.pseudonym AND b.day = c.day
      ON CONFLICT DO NOTHING
    `);
  }
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_pulse_platform_daily_ingestion_day
    ON "PulsePlatformDailyIngestion" ("day")
  `);

  if (!(await knex.schema.hasTable('PulseRejection'))) {
    await knex.schema.createTable('PulseRejection', (table) => {
      table.date('day').notNullable();
      table.text('operation').notNullable();
      table.text('code').notNullable();
      table.integer('request_count').notNullable();
      table.primary(['day', 'operation', 'code']);
    });
  }

  if (!(await knex.schema.hasTable('PulsePurgeRequest'))) {
    await knex.schema.createTable('PulsePurgeRequest', (table) => {
      table.binary('pseudonym').notNullable();
      table.date('day').notNullable();
      table.integer('request_count').notNullable();
      table.primary(['pseudonym', 'day']);
    });
  }
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_pulse_purge_request_day
    ON "PulsePurgeRequest" ("day")
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('PulsePurgeRequest');
  await knex.schema.dropTableIfExists('PulseRejection');
  await knex.schema.dropTableIfExists('PulsePlatformDailyIngestion');
}
