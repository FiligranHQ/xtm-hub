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
}
