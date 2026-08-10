const OPENCTI_PRODUCT = ['opencti'];

const SOLUTION_CATEGORIES = [
  {
    id: '0f2389ee-ef55-4704-9b39-03f4824f4861',
    name: 'Threat Intelligence Feed',
  },
  {
    id: '59af1b49-a95f-4d02-92d8-aaef8e65fbde',
    name: 'Endpoint Detection & Response',
  },
  {
    id: '15f4bb11-4792-4785-95f6-8e2f57dd58ce',
    name: 'SIEM & Security Analytics',
  },
  {
    id: '5ce90a90-a5a5-4547-af9c-7d330f39e91f',
    name: 'Malware Analysis & Sandbox',
  },
  {
    id: '1a7cc00d-e9fe-4e6f-8e10-801e9cf76ea6',
    name: 'SOAR & Security Automation',
  },
  {
    id: '9f1ea6ec-34cd-4af4-a2d8-b9f94dffc14f',
    name: 'Vulnerability & Exposure Management',
  },
  {
    id: '952e0ac9-48d9-4f58-a715-2afe8ee45786',
    name: 'Attack Surface Management',
  },
  { id: '1e99b961-1249-4d17-8f08-7f2ca6b9952f', name: 'Network Security' },
  { id: '0f8f18e7-fa03-4f10-ae50-4b62f67f1deb', name: 'Email Security' },
  { id: 'd49dcc86-c0fa-454f-b5ba-ff66f6fcf87c', name: 'AI Security' },
  {
    id: '77847f84-fa4f-4078-a9bf-3b420d59d0a0',
    name: 'Incident Response & Case Management',
  },
  {
    id: '4a4e3bc6-9bf4-4ebe-a8ef-f9b11d85e7c4',
    name: 'Digital Risk Protection',
  },
  {
    id: 'd26130f8-c24b-453d-ad87-089c1a6f19bc',
    name: 'Governance, Risk & Compliance',
  },
  { id: '6f7c82fd-4445-4788-8883-98534ab39108', name: 'Cloud Security' },
  {
    id: 'a9ce1a39-6f86-4f17-9874-5932ff50224f',
    name: 'Enrichment & Reputation',
  },
  {
    id: '51b4ee2b-40e8-48ee-b355-f53dd46a7b12',
    name: 'Import, Export & Sharing',
  },
  { id: 'f95c7db9-ad8e-4d6d-8585-9d68cd4c9c03', name: 'Other' },
];

const SOLUTION_CATEGORY_IDS = SOLUTION_CATEGORIES.map(({ id }) => id);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('SolutionCategory')
    .insert(
      SOLUTION_CATEGORIES.map(({ id, name }) => ({
        id,
        name,
        product: OPENCTI_PRODUCT,
      }))
    )
    .onConflict('id')
    .merge(['name', 'product']);
}

/**
 * Fails if categories are already linked (Object_SolutionCategory has no
 * cascade on solution_category_id) — intentional: a rollback must not
 * silently drop ingested links.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('SolutionCategory').whereIn('id', SOLUTION_CATEGORY_IDS).delete();
}
