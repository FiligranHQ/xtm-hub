/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceInstance').where({ name: 'OpenCTI Demo' }).update({
    description:
      'Access a live OpenCTI demo instance and explore all of its features.',
  });
  await knex('ServiceInstance').where({ name: 'OpenBAS Demo' }).update({
    description:
      'Access a live OpenBAS demo instance and explore all of its features.',
  });
  await knex('ServiceInstance')
    .where({ name: 'OpenBAS Documentation' })
    .update({
      description:
        'Find all documents to get started with our breach and attack simulation platform, also includes release notes and presentations.',
    });
  await knex('ServiceInstance')
    .where({ name: 'OpenCTI Documentation' })
    .update({
      description:
        'Find all documents to get started with our threat intelligence platform, also includes release notes and presentations.',
    });
  await knex('ServiceInstance').where({ name: 'Slack' }).update({
    description:
      'Connect with our growing threat management community (5000+ members). Share your experiences and find the support you need.',
  });
  await knex('Service_Link').where({ name: 'Slack' }).update({
    url: 'https://filigran-community.slack.com/ssb/redirect',
  });
  await knex('ServiceInstance').where({ name: 'Filigran Blog' }).update({
    description:
      'Discover the latest articles about OpenCTI, OpenBAS and more.',
  });
  await knex('ServiceInstance').where({ name: 'Filigran Academy' }).update({
    description:
      'Master OpenCTI and OpenBAS with Filigran Academy—your ultimate guide to success across all skill levels!',
  });
  await knex('ServiceInstance')
    .where({ name: 'OpenCTI Custom Dashboards Library' })
    .update({
      description:
        'Explore a range of threat management custom dashboards, helping you make the most effective use of OpenCTI.',
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceInstance').where({ name: 'OpenCTI Demo' }).update({
    description: 'Try openCTI',
  });
  await knex('ServiceInstance').where({ name: 'OpenBAS Demo' }).update({
    description: 'Try openBAS',
  });
  await knex('ServiceInstance')
    .where({ name: 'OpenBAS Documentation' })
    .update({
      description: 'Find all documents related to openBAS',
    });
  await knex('ServiceInstance')
    .where({ name: 'OpenCTI Documentation' })
    .update({
      description: 'Find all documents related to openCTI',
    });
  await knex('ServiceInstance').where({ name: 'Slack' }).update({
    description: 'Join our slack community',
  });
  await knex('Service_Link').where({ name: 'Slack' }).update({
    url: 'https://community.filigran.io/',
  });
  await knex('ServiceInstance').where({ name: 'Filigran Blog' }).update({
    description: 'Read our latest articles',
  });
  await knex('ServiceInstance').where({ name: 'Filigran Academy' }).update({
    description:
      'Master OpenCTI and OpenBAS with Filigran Academy—your ultimate guide to success across all skill levels!',
  });
  await knex('ServiceInstance')
    .where({ name: 'OpenCTI Custom Dashboards Library' })
    .update({
      description:
        'Explore a range of custom dashboards created and shared by the Filigran team',
    });
}
