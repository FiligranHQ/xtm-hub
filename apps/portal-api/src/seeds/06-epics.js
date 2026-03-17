export async function seed(knex) {
  const BYPASS_USER_ID = 'ba091095-418f-4b4f-b150-6c9295e232c3';

  await knex('Epic')
    .insert([
      {
        id: 'f3d8c580-3ba9-4fd5-b4e2-2a7a8fbd76c1',
        epic: 'The Wall of Indicators',
        title: 'Night Watch for Indicators',
        short_description: 'The Ravens of the Wall monitor IOCs 24/7.',
        description:
          'Like the Night’s Watch, this *epic* consolidates the detection and **prioritization** of critical indicators before the White Walkers reach production.',
        active: true,
        product: 'opencti',
        timeline: 'now',
        epic_type: 'other',
        uploader_id: BYPASS_USER_ID,
      },
      {
        id: '0c2af0da-f842-4d05-86cb-5b9f1c95df29',
        epic: 'Dragonfire Campaign',
        title: 'Khaleesi Stress Tests',
        short_description:
          'OpenAEV launches fire-and-blood scenarios to test resilience.',
        description:
          'This epic runs continuous validation campaigns to ensure the defenses hold even against Drogon in full rage mode.',
        active: true,
        product: 'openaev',
        timeline: 'next',
        epic_type: 'other',
        uploader_id: BYPASS_USER_ID,
      },
      {
        id: '5ca4bd8b-2b11-49cf-af7a-f9246ff4583a',
        epic: 'Iron Throne',
        title: 'One Hub to Rule Them All',
        short_description:
          'XTM Hub unifies Westeros integrations without house wars.',
        description:
          'This epic aligns product flows in a single portal to avoid dashboard battles between Stark, Lannister, and Targaryen.',
        active: true,
        product: 'xtmhub',
        timeline: 'under_consideration',
        epic_type: 'other',
        uploader_id: BYPASS_USER_ID,
      },
      {
        id: '2630e289-5d09-47fd-85d8-56f230177577',
        epic: 'Valar Morghulis',
        title: 'Faceless Prioritization',
        short_description: 'Every obsolete ticket must die, for OpenCTI.',
        description:
          'Arya sorts the backlog with precision to accelerate user value and keep only truly strategic initiatives.',
        active: false,
        product: 'opencti',
        timeline: 'under_consideration',
        epic_type: 'other',
        uploader_id: BYPASS_USER_ID,
      },
    ])
    .onConflict('id')
    .ignore();
}
