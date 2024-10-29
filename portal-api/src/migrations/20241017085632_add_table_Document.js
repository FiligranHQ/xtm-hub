export async function up(knex) {
    await knex.schema.createTable('Document', (table) => {
        table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
        table.uuid('uploader_id');
        table.uuid('service_id').references('id').inTable('Service').onDelete('CASCADE');
        table.string('short_name')
        table.text('description')
        table.string('file_name')
        table.string('minio_name')
        table.boolean('active').defaultTo(true);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    });
    }

export async function down(knex) {
    await knex.schema.dropTable('Document');
}
