export async function up(knex) {
    // Create table organization
    await knex.schema.createTable('organizations', (table) => {
        table.string('id').primary();
        table.string('name');
        table.unique('name');
    });

    // Create table user
    await knex.schema.createTable('users', (table) => {
        table.string('id').primary();
        table.string('email');
        table.unique('email');
        table.string('salt').notNullable();
        table.string('password').notNullable();
        table.string('first_name');
        table.string('last_name');
        table.string('organization_id').notNullable();
        table.foreign('organization_id').references('id').inTable('organizations');
    });

    // Create table deployment
    await knex.schema.createTable('services', (table) => {
        table.string('id').primary();
        table.string('name').notNullable();
        table.string('description');
    });

    // Create table subscription
    // await knex.schema.createTable('subscriptions', (table) => {
    //     table.string('id').primary();
    //     table.string('name').notNullable();
    //     table.string('description');
    //     table.string('service').notNullable();
    //     table.foreign('service').references('id').inTable('services');
    // });
}

export async function down(knex) {
    await knex.schema.dropTable('organizations');
    await knex.schema.dropTable('users');
    await knex.schema.dropTable('services');
}

