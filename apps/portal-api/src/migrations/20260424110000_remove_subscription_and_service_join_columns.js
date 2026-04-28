export async function up(knex) {
  await knex.schema.table('Subscription', function (table) {
    table.dropColumn('status');
    table.dropColumn('joining');
    table.dropColumn('billing');
    table.dropColumn('justification');
  });
  await knex.schema.table('ServiceInstance', function (table) {
    table.dropColumn('join_type');
  });
}

export async function down(knex) {
  await knex.schema.table('Subscription', function (table) {
    table
      .enum('joining', ['SELF_JOIN', 'AUTO_JOIN', 'ASK_TO_JOIN'])
      .defaultTo('AUTO_JOIN');
    table.integer('billing').defaultTo(100);
    table
      .enum('status', ['REQUESTED', 'ACCEPTED', 'REFUSED'])
      .defaultTo('ACCEPTED');
    table.text('justification');
  });
  await knex.schema.table('ServiceInstance', function (table) {
    table
      .enum('join_type', ['JOIN_INVITE', 'JOIN_ASK', 'JOIN_AUTO', 'JOIN_SELF'])
      .defaultTo('JOIN_INVITE');
  });
}
