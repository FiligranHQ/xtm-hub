export async function up(knex) {
    // Ensure UUID extension is activated
    await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create table organization
    await knex.schema.createTable('Organization', (table) => {
        table.uuid('id', { primaryKey: true });
        table.string('name');
        table.unique('name');
    });

    // Create table user
    await knex.schema.createTable('User', (table) => {
        table.uuid('id', { primaryKey: true });
        table.string('email');
        table.unique('email');
        table.string('salt').notNullable();
        table.string('password').notNullable();
        table.string('first_name');
        table.string('last_name');
        table.uuid('organization_id').notNullable();
        table.foreign('organization_id').references('id').inTable('Organization');
    });

    // Create table deployment
    await knex.schema.createTable('Service', (table) => {
        table.uuid('id', { primaryKey: true });
        table.string('name').notNullable();
        table.string('description');
    });

    // Create table subscription
    // await knex.schema.createTable('subscriptions', (table) => {
    //     table.uuid('id', { primaryKey: true });
    //     table.string('name').notNullable();
    //     table.string('description');
    //     table.string('service').notNullable();
    //     table.foreign('service').references('id').inTable('services');
    // });
}

export async function down(knex) {
    await knex.schema.raw('DROP EXTENSION "uuid-ossp"');
    await knex.schema.dropTable('Organization');
    await knex.schema.dropTable('User');
    await knex.schema.dropTable('Service');
}

