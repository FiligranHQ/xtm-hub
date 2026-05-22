/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`ALTER TABLE "Epic" DROP CONSTRAINT "Epic_timeline_check"`);
  await knex.raw(`
    ALTER TABLE "Epic" 
    ADD CONSTRAINT "Epic_timeline_check" 
    CHECK (timeline IN ('now', 'next', 'under_consideration', 'finished'))
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`ALTER TABLE "Epic" DROP CONSTRAINT "Epic_timeline_check"`);
  await knex.raw(`
    ALTER TABLE "Epic" 
    ADD CONSTRAINT "Epic_timeline_check" 
    CHECK (timeline IN ('now', 'next', 'under_consideration'))
  `);
}
