export async function seed(knex) {
  // Use cases seed data from production
  await knex('UseCase')
    .insert([
      {
        id: '00e8b44d-830a-4066-bc97-f8c4ee5b53a5',
        name: 'stream consumer sources',
        color: '#417505',
      },
      {
        id: '06dfa289-f106-45c5-8b0d-648caec0aca7',
        name: 'Assets security',
        color: '#34b7da',
      },
      {
        id: '109529ca-247b-4eba-887c-1297806578a9',
        name: 'Incident Management',
        color: '#9013fe',
      },
      {
        id: '1f6df625-88ee-412b-9400-056d99175769',
        name: 'Detection & prevention sources',
        color: '#9b9b9b',
      },
      {
        id: '23d58867-f763-4d46-a006-468e7bc0bc2b',
        name: 'TABLETOP Exercise',
        color: '#9013fe',
      },
      {
        id: '2469437c-33aa-439c-8f70-b90da8d4ccd5',
        name: 'Strategic ',
        color: '#f8e71c',
      },
      {
        id: '28232866-7a93-404b-acb3-68a6efc6e5a7',
        name: 'Threat monitoring',
        color: '#f132f3',
      },
      {
        id: '44fa5750-102d-4b08-9af8-e71f6014ff58',
        name: 'TECHNICAL',
        color: '#50e3c2',
      },
      {
        id: '4a378992-d5f0-458e-8fc6-527c7c644a18',
        name: 'Vulnerability Assessment',
        color: '#50e3c2',
      },
      {
        id: '5aac6fa2-d8ed-4c55-8275-7d9f6d078d35',
        name: 'Threat Intelligence',
        color: '#1212cc',
      },
      {
        id: '6148fa3c-0845-43c1-b877-bbe1fa3d8494',
        name: 'DEFENSE',
        color: '#348048',
      },
      {
        id: '64aed898-bf64-4872-b83c-b7b720d2edb7',
        name: 'Global',
        color: '#f5a623',
      },
      {
        id: '6d920874-91b1-4288-95d1-019815400e22',
        name: 'CobaltStrike',
        color: '#8b572a',
      },
      {
        id: '6d9d5742-62dc-4d09-b322-9635bc17677e',
        name: 'map widget',
        color: '#e07518',
      },
      {
        id: '756dfc13-b489-4ac5-b8b5-0a2f50ddcf79',
        name: 'cryptocurrency',
        color: '#417505',
      },
      {
        id: '7d4b76be-ccdf-4a23-ad38-7aa58844ff04',
        name: 'ransomware',
        color: '#ffffff',
      },
      {
        id: '7e1f5dac-caae-417d-8dd7-36d7f5d33c19',
        name: 'Vulnerability Management',
        color: '#7ed321',
      },
      {
        id: '948917cd-91eb-4e70-9da5-c8208d91a217',
        name: 'Administration',
        color: '#8b572a',
      },
      {
        id: 'c3335831-66ee-4302-af74-09f618b76d67',
        name: 'Health',
        color: '#cc9898',
      },
      {
        id: 'e8cc0bda-ad00-4bbf-adaf-eb3baa0fe8d5',
        name: 'Proactive Security',
        color: '#ffffff',
      },
      {
        id: 'ea220fcf-13e1-43d7-b0c6-2f482ff5f729',
        name: 'Data library import',
        color: '#50e3c2',
      },
      {
        id: 'f0a073d4-c8f4-4be2-b44b-13685de8bdd7',
        name: 'LolBas',
        color: '#d0021b',
      },
      {
        id: 'f2133081-1f84-41b3-b224-c74aecb2ef51',
        name: 'Energy',
        color: '#b91111',
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('SolutionCategory')
    .insert([
      {
        id: '0f2389ee-ef55-4704-9b39-03f4824f4861',
        name: 'Threat Intelligence Feed',
        product: ['opencti'],
      },
      {
        id: '59af1b49-a95f-4d02-92d8-aaef8e65fbde',
        name: 'Endpoint Detection & Response',
        product: ['opencti'],
      },
      {
        id: '15f4bb11-4792-4785-95f6-8e2f57dd58ce',
        name: 'SIEM & Security Analytics',
        product: ['opencti'],
      },
      {
        id: '5ce90a90-a5a5-4547-af9c-7d330f39e91f',
        name: 'Malware Analysis & Sandbox',
        product: ['opencti'],
      },
      {
        id: '1a7cc00d-e9fe-4e6f-8e10-801e9cf76ea6',
        name: 'SOAR & Security Automation',
        product: ['opencti'],
      },
      {
        id: '9f1ea6ec-34cd-4af4-a2d8-b9f94dffc14f',
        name: 'Vulnerability & Exposure Management',
        product: ['opencti'],
      },
      {
        id: '952e0ac9-48d9-4f58-a715-2afe8ee45786',
        name: 'Attack Surface Management',
        product: ['opencti'],
      },
      {
        id: '1e99b961-1249-4d17-8f08-7f2ca6b9952f',
        name: 'Network Security',
        product: ['opencti'],
      },
      {
        id: '0f8f18e7-fa03-4f10-ae50-4b62f67f1deb',
        name: 'Email Security',
        product: ['opencti'],
      },
      {
        id: 'd49dcc86-c0fa-454f-b5ba-ff66f6fcf87c',
        name: 'AI Security',
        product: ['opencti'],
      },
      {
        id: '77847f84-fa4f-4078-a9bf-3b420d59d0a0',
        name: 'Incident Response & Case Management',
        product: ['opencti'],
      },
      {
        id: '4a4e3bc6-9bf4-4ebe-a8ef-f9b11d85e7c4',
        name: 'Digital Risk Protection',
        product: ['opencti'],
      },
      {
        id: 'd26130f8-c24b-453d-ad87-089c1a6f19bc',
        name: 'Governance, Risk & Compliance',
        product: ['opencti'],
      },
      {
        id: '6f7c82fd-4445-4788-8883-98534ab39108',
        name: 'Cloud Security',
        product: ['opencti'],
      },
      {
        id: 'a9ce1a39-6f86-4f17-9874-5932ff50224f',
        name: 'Enrichment & Reputation',
        product: ['opencti'],
      },
      {
        id: '51b4ee2b-40e8-48ee-b355-f53dd46a7b12',
        name: 'Import, Export & Sharing',
        product: ['opencti'],
      },
      {
        id: 'f95c7db9-ad8e-4d6d-8585-9d68cd4c9c03',
        name: 'Other',
        product: ['opencti'],
      },
    ])
    .onConflict('id')
    .ignore();
}
