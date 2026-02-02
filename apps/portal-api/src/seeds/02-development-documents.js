export async function seed(knex) {
  // Documents seed data from production
  // All uploader_id replaced with BYPASS_USER for development
  const BYPASS_USER_ID = 'ba091095-418f-4b4f-b150-6c9295e232c3';

  // Get the correct service_instance_id from existing services
  const customDashboardService = await knex('ServiceInstance')
    .join(
      'ServiceDefinition',
      'ServiceInstance.service_definition_id',
      'ServiceDefinition.id'
    )
    .where('ServiceDefinition.identifier', 'opencti_custom_dashboards')
    .select('ServiceInstance.id')
    .first();

  const integrationFeedsService = await knex('ServiceInstance')
    .join(
      'ServiceDefinition',
      'ServiceInstance.service_definition_id',
      'ServiceDefinition.id'
    )
    .where('ServiceDefinition.identifier', 'opencti_integrations')
    .select('ServiceInstance.id')
    .first();

  const openaevScenariosService = await knex('ServiceInstance')
    .join(
      'ServiceDefinition',
      'ServiceInstance.service_definition_id',
      'ServiceDefinition.id'
    )
    .where('ServiceDefinition.identifier', 'openaev_scenarios')
    .select('ServiceInstance.id')
    .first();

  await knex('Document')
    .insert([
      {
        id: '187dfc29-631d-4795-aa59-4c8bdcc3fb5a',
        uploader_id: BYPASS_USER_ID,
        service_instance_id: customDashboardService?.id || null,
        description:
          "The **[Strategic Sector]  Hospitality** dashboard is designed to provide a comprehensive overview of threats reported to be targeting the sector. This dashboards provides a first-look top-down overview of all threats targeting the sector, and can be adapted to address specific Priority Intelligence Requirements (PIRs) targeting the sector.\n\n### Overview\n\n- The **High Level Indicators** section gives aggregate statistics for the entire dataset, giving situational awareness of the total volume of data in the platform\n- **Active Threats** shows the total number of reports for each threat actor that contain this sector  or a sub-sector in the report\n- **Recent Activities** shows a timeline of campaigns that contain the sector\n- **Technical Information** shows counts of indicators relating to the sector\n\n### Usage\n\n- The **High Level Indicators** give an idea of the volume of data in your platform that is categorised as relating to the sector. If these figures are low, then the other threat-centric widgets will also have a low count. If you have a low count, common reasons can include: low volume of ingested data;  ingested data does not contain sector as a STIX entity; too few reports in the time range set for the dashboard.\n- **Active Threats** shows Intrusion Sets, Threat Actors and Malware that have been reported as targeting the sector within the time range for the dashboard (usually from a report linking the threat to the sector that was received within the time range). Changing the time range to a recent time range, such as 1 or 3 months, will focus on more recent reports of threats against the sector.\n- **Top Techniques used by Threats** shows Attack Patterns (typically MITRE ATT&CK Techniques) known to be used by an Actor or Intrusion Set targeting the sector. Where a report contains the sector as a target, and the actor or intrusion set, then all Attack Patterns / TTPs known to be used by these actors (not just the TTPs included in the reports, or TTPs used against this sector) will be shown here.\n- **Top Vulnerabilities targeted by Threats** shows Vulnerabilities that were reported as being targeted by a Threat Actor or Intrusion Set, that targets the sector. This chart is indicative of vulnerabilities that are at a higher risk of exploitation in organisations within the sector.\n- **Top Attack Patterns from Reports** aggregates the TTPs included in the reports that reference this sector. Unlike the previous TTP graph, this only shows the TTPs that were mentioned in reports about the sector, rather than showing all TTPs known to be used by actors targeting the sector.\n\n### Data Pre-requisites\n\nAll widgets in this dashboard rely on reports ingested into OpenCTI that contain structured STIX entities, including targeted sector, threat actors, intrusion sets, malware entities, and indicators. If you do not have a stream of reports into OpenCTI that contain these entities, these dashboards will be empty. Most commercial feeds, and some open-source ones, will contain this structur\n\nIn addition, you can improve the inclusion of content in this report by:\n\n1. Configuring the **OpenCTI Datasets** connector, which ingests the master datasets, including sectors, with the UUIDs that are used in this dashboard. Each widget uses the specific UUID for the sector from this specific dataset.\n2. Turning on many of the **Rules engine** rules, that infer relationships between entities that are contained in a report (eg. if actor targets 'Renewables', then infer that actor targets 'Energy')\n3. Reviewing all Sectors, and checking that 'similar' sectors from other feeds are merged into the master entity from the OpenCTI Dataset, or at least are a child/subset of it. (eg. 'Energy-Renewables' is merged with 'Renewables', which is a subset of 'Energy')\n\nSpecific relationships that are used in these widgets include:\n\n- The relationship of Threat Actor or Intrusion Set ***targets*** the sector\n- The relationship of Threat Actor or Intrusion Set ***targets*** a vulnerability\n- The relationship of Threat Actor or Intrusion Set ***uses*** an Attack Pattern\n- The relationship of Threat Actor or Intrusion Set ***uses*** a Malware\n- The relationship of Indicator ***indicates*** a Malware, Threat Actors, Intrusion Set, Campaign",
        file_name: '[strategic-sector]-hospitality.json',
        minio_name: '[Strategic Sector] Hospitality_1742309267622.json',
        active: false,
        created_at: '2025-03-18 14:47:47.711+00',
        remover_id: null,
        mime_type: 'application/json',
        name: '[Strategic sector] Hospitality',
        updated_at: '2025-06-26 14:07:53.679+00',
        updater_id: 'ec9c108e-6bb2-4928-86cd-decf2ef59f44',
        short_description:
          'A strategic dashboard that shows threats facing the Hospitality sector, one of a series of sector-focused dashboards. It includes overviews of Actors, Malware, TTPs and Vulnerabilities reported to be targeting organisations in the sector.',
        slug: 'strategic-sector-hospitality',
        uploader_organization_id: null,
        type: 'opencti_custom_dashboard',
        source_type: 'internal',
      },
      {
        id: 'bb734d93-4823-4637-a216-518d8ef55628',
        uploader_id: ADMIN_UUID,
        service_instance_id: customDashboardService?.id || null,
        description:
          'A strategic dashboard that shows threats facing the Banking institutions sector, one of a series of sector-focused dashboards. It includes overviews of Actors, Malware, TTPs and Vulnerabilities reported to be targeting organisations in the sector.\nThe Banking institutions dashboard is designed to provide a comprehensive overview of threats reported to be targeting the sector. This dashboards provides a first-look top-down overview of all threats targeting the sector, and can be adapted to address specific Priority Intelligence Requirements (PIRs) targeting the sector.',
        file_name: 'banking-institutions.json',
        minio_name: 'Banking institutions.json',
        active: true,
        created_at: '2025-07-18 14:47:47.711+00',
        remover_id: null,
        mime_type: 'application/json',
        name: 'Banking institutions',
        updated_at: '2025-06-26 14:07:53.679+00',
        updater_id: 'ec9c108e-6bb2-4928-86cd-decf2ef59f44',
        short_description:
          'A strategic dashboard that shows threats facing the Banking institutions sector, one of a series of sector-focused dashboards. It includes overviews of Actors, Malware, TTPs and Vulnerabilities reported to be targeting organisations in the sector.',
        slug: 'banking-institutions',
        uploader_organization_id: null,
        type: 'opencti_custom_dashboard',
        source_type: 'internal',
      },
      {
        id: '7effeac6-8939-4316-8278-6adbe5c5dcb8',
        uploader_id: BYPASS_USER_ID,
        service_instance_id: openaevScenariosService?.id || null,
        description:
          "🌐 What is External Attack Surface Management (EASM)?\n\nEASM is a cybersecurity practice focused on discovering, mapping, and continuously monitoring all internet-facing assets of an organization (websites, IP addresses, cloud services, APIs, admin portals, etc.).\n👉 The goal is to take the attacker's perspective in order to identify vulnerabilities, misconfigurations, or forgotten services before they can be exploited.\n\nKey challenges it addresses:\n\n🔎 Eliminating blind spots (shadow IT, unmanaged services)\n\n⚠️ Detecting vulnerabilities (CVEs) and risky configurations early\n\n🛡️ Maintaining a strong security posture in a constantly evolving IT environment\n\n⚙️ How OpenAEV solves this challenge\n\nWith OpenAEV, an EASM scenario can be set up in a fully agentless way (no installation required):\n\n🆔 Simply define an asset using an IP address or FQDN.\n\n🧭 OpenBAS then performs enumeration just like an attacker would:\n\nIdentifying open ports and running services\n\nDetecting exposed administration portals\n\nChecking for known vulnerabilities (CVEs)\n\nHighlighting misconfigurations (e.g., default credentials)\n\n📊 Findings are correlated and reported, giving clear visibility into external exposure.\n\n⏰ By scheduling this scenario daily, organizations ensure their scope remains secure over time.\n\n👉 In short, combining EASM + OpenBAS enables:\n✅ Thinking like an attacker\n✅ Continuously monitoring external exposure\n✅ Validating the security of the perimeter day after day 🚀",
        file_name: 'easm.zip',
        minio_name: 'EASM_1757323580085.zip',
        active: true,
        created_at: '2025-09-08 09:24:23.770564+00',
        remover_id: null,
        mime_type: 'application/x-zip-compressed',
        name: 'EASM Scenario',
        updated_at: '2025-09-08 09:34:53.206+00',
        updater_id: BYPASS_USER_ID,
        short_description: 'EASM Scenario',
        slug: 'easm-scenario',
        uploader_organization_id: null,
        type: 'openaev_scenario',
        source_type: 'internal',
      },
      {
        id: '1275352d-c49e-458d-b340-4e40d2035249',
        uploader_id: ADMIN_UUID,
        service_instance_id: openaevScenariosService?.id || null,
        description:
          'This scenario focuses on the discovery and exploitation of SUID misconfigurations on Linux systems, specifically targeting the find binary 🐧. The objective is to achieve privilege escalation to root by abusing an improperly configured SUID find binary.',
        file_name: 'linux-privilege.zip',
        minio_name: 'linux-privilege.zip',
        active: true,
        created_at: '2025-09-06 09:24:23.770564+00',
        remover_id: null,
        mime_type: 'application/x-zip-compressed',
        name: 'Linux Privilege Escalation via Find Command',
        updated_at: '2025-12-26 09:34:53.206+00',
        updater_id: ADMIN_UUID,
        short_description:
          'Check your SUID/SGID, exploit it and validate your security platforms works as expected',
        slug: 'linux-privilege',
        uploader_organization_id: null,
        type: 'openaev_scenario',
        source_type: 'internal',
      },
      {
        id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        uploader_id: BYPASS_USER_ID,
        service_instance_id: integrationFeedsService?.id || null,
        description:
          'A list of CobaltStrike Infrastructure from https://threatview.io/Downloads/High-Confidence-CobaltStrike-C2 -Feeds.txt\tThis CSV feed ingester is designed to import and process data on identified CobaltStrike command and control (C2) infrastructure from ThreatView.io. CobaltStrike is a commercial penetration testing tool frequently misused by threat actors for malicious purposes. The feed contains high-confidence indicators of servers running CobaltStrike C2 infrastructure, allowing security teams to block connections to these known malicious endpoints. By incorporating this intelligence into OpenCTI, organizations can proactively defend against attacks utilizing this popular threat actor tool, identify potential ongoing compromises, and enhance their network defense capabilities against threat campaigns.',
        file_name: '20250704_csvfeed_threatview.io-c2-hunt-feed.json',
        minio_name:
          '20250704_csvFeed_Threatview_1751629637782.io - C2 Hunt Feed',
        active: true,
        created_at: '2025-06-26 09:49:34.912159+00',
        remover_id: null,
        mime_type: 'application/json',
        name: 'Threatview.io - C2 Hunt Feed',
        updated_at: '2025-07-24 07:08:32.088+00',
        updater_id: '63678b35-2f72-4607-89cc-2e06036bf012',
        short_description:
          'A list of CobaltStrike Infrastructure from https://threatview.io/Downloads/High-Confidence-CobaltStrike-C2 -Feeds.txt',
        slug: 'threatviewio-c2-hunt-feed',
        uploader_organization_id: null,
        type: 'opencti_integration',
        source_type: 'internal',
      },
      {
        id: '1b226f91-4896-4298-af2d-1de0aae63e62',
        uploader_id: BYPASS_USER_ID,
        service_instance_id: integrationFeedsService?.id || null,
        description:
          'Cybersecurity and Infrastructure Security Agency TAXII Feed',
        file_name: 'CISA_taxii_feed.json',
        minio_name: 'CISA_taxii_feed',
        active: true,
        created_at: '2025-06-26 09:49:34.912159+00',
        remover_id: null,
        mime_type: 'application/json',
        name: 'CISA',
        updated_at: '2025-07-24 07:08:32.088+00',
        updater_id: '63678b35-2f72-4607-89cc-2e06036bf012',
        short_description: 'A TAXII Feed from CISA',
        slug: 'cisa',
        uploader_organization_id: null,
        type: 'opencti_integration',
        source_type: 'internal',
      },
      {
        id: 'e53832ce-2f5a-4fe5-ba5b-6fef1d6ad1d4',
        uploader_id: BYPASS_USER_ID,
        service_instance_id: integrationFeedsService?.id || null,
        description: 'Intrinsec OpenCTI Stream',
        file_name: 'intrinsec_stream.json',
        minio_name: 'intrinsec_stream',
        active: true,
        created_at: '2025-06-26 09:49:34.912159+00',
        remover_id: null,
        mime_type: 'application/json',
        name: 'Intrinsec Stream',
        updated_at: '2025-07-24 07:08:32.088+00',
        updater_id: '63678b35-2f72-4607-89cc-2e06036bf012',
        short_description: 'A Stream from Intrinsec',
        slug: 'intrinsec-stream',
        uploader_organization_id: null,
        type: 'opencti_integration',
        source_type: 'internal',
      },
      {
        id: '00ab5423-1b12-468f-9d67-2af079807205',
        uploader_id: BYPASS_USER_ID,
        service_instance_id: integrationFeedsService?.id || null,
        description: 'Elastic third party integration long description',
        active: true,
        created_at: '2025-06-26 09:49:34.912159+00',
        remover_id: null,
        name: 'Elastic',
        updated_at: '2025-07-24 07:08:32.088+00',
        updater_id: '63678b35-2f72-4607-89cc-2e06036bf012',
        short_description: 'Third party integration with ElasticSearch',
        slug: 'elasticsearch',
        uploader_organization_id: null,
        type: 'opencti_integration',
        source_type: 'internal',
      },
    ])
    .onConflict('id')
    .ignore();
}
