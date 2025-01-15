import { v4 } from 'uuid';

const SERVICES = {
  octi: {
    id: v4(),
    name: 'openCTI Demo',
    description: 'Try openCTI',
    provider: 'FILIGRAN',
    type: 'link',
    creation_status: 'READY',
    public: true,
    join_type: 'JOIN_AUTO',
    tags: ['openCTI'],
  },
  obas: {
    id: v4(),
    name: 'openBAS Demo',
    description: 'Try openBAS',
    provider: 'FILIGRAN',
    type: 'link',
    creation_status: 'READY',
    public: true,
    join_type: 'JOIN_AUTO',
    tags: ['openBAS'],
  },
  obas_doc: {
    id: v4(),
    name: 'openBAS documentation',
    description: 'Find all documents related to openBAS',
    provider: 'FILIGRAN',
    type: 'link',
    creation_status: 'READY',
    public: true,
    join_type: 'JOIN_AUTO',
    tags: ['openBAS'],
  },
  octi_doc: {
    id: v4(),
    name: 'openCTI documentation',
    description: 'Find all documents related to openCTI',
    provider: 'FILIGRAN',
    type: 'link',
    creation_status: 'READY',
    public: true,
    join_type: 'JOIN_AUTO',
    tags: ['openCTI'],
  },
  slack: {
    id: v4(),
    name: 'Slack',
    description: 'Join our slack community',
    provider: 'FILIGRAN',
    type: 'link',
    creation_status: 'READY',
    public: true,
    join_type: 'JOIN_AUTO',
    tags: [],
  },
  blog: {
    id: v4(),
    name: 'Filigran Blog',
    description: 'Read our latest articles',
    provider: 'FILIGRAN',
    type: 'link',
    creation_status: 'READY',
    public: true,
    join_type: 'JOIN_AUTO',
    tags: [],
  },
  academy: {
    id: v4(),
    name: 'Filigran Academy',
    description:
      'Master OpenCTI and OpenBAS with Filigran Academy—your ultimate guide to success across all skill levels!',
    provider: 'FILIGRAN',
    type: 'link',
    creation_status: 'PENDING',
    public: true,
    join_type: 'JOIN_AUTO',
    tags: [],
  },
  custom_dashboards: {
    id: v4(),
    name: 'openCTI custom Dashboards Library',
    description: '',
    provider: 'FILIGRAN',
    type: 'link',
    creation_status: 'PENDING',
    public: true,
    join_type: 'JOIN_AUTO',
    tags: null,
  },
};

const SERVICE_LINKS = {
  octi: {
    id: v4(),
    service_id: SERVICES.octi.id,
    url: 'https://demo.opencti.io',
    name: 'openCTI Demo',
  },
  obas: {
    id: v4(),
    service_id: SERVICES.obas.id,
    url: 'https://demo.openbas.io',
    name: 'openBAS Demo',
  },
  obas_doc: {
    id: v4(),
    service_id: SERVICES.obas_doc.id,
    url: 'https://docs.openbas.io/latest/',
    name: 'openBAS doc',
  },
  octi_doc: {
    id: v4(),
    service_id: SERVICES.octi_doc.id,
    url: 'https://docs.opencti.io/latest/',
    name: 'openCTI doc',
  },
  slack: {
    id: v4(),
    service_id: SERVICES.slack.id,
    url: 'https://filigran.io/solutions/xtm-hub/',
    name: 'Slack',
  },
  blog: {
    id: v4(),
    service_id: SERVICES.blog.id,
    url: 'https://filigran.io/solutions/xtm-hub/',
    name: 'Blog',
  },
  academy: {
    id: v4(),
    service_id: SERVICES.academy.id,
    url: '',
    name: 'Filigran Academy',
  },
  custom_dashboards: {
    id: v4(),
    service_id: SERVICES.custom_dashboards.id,
    url: '',
    name: '',
  },
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Add tags column to Service table
  await knex.schema.table('Service', function (table) {
    table.specificType('tags', 'varchar(20)[]');
  });

  // Insert new services
  await knex.batchInsert('Service', Object.values(SERVICES));

  // Insert new service links
  await knex.batchInsert('Service_Link', Object.values(SERVICE_LINKS));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex
    .delete()
    .from('Service_Link')
    .whereIn('url', [
      'https://demo.opencti.io',
      'https://demo.openbas.io',
      'https://docs.openbas.io/latest/',
      'https://docs.opencti.io/latest/',
      'https://filigran.io/solutions/xtm-hub/',
    ]);
  await knex
    .delete()
    .from('Service')
    .whereIn('name', [
      'openCTI Demo',
      'openBAS Demo',
      'openBAS documentation',
      'openCTI documentation',
      'Slack',
      'Filigran Blog',
      'Filigran Academy',
      'openCTI custom Dashboards Library',
    ]);

  await knex.schema.table('Service', function (table) {
    table.dropColumn('tags');
  });
}
