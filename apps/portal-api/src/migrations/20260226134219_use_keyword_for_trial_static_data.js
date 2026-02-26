/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('DeploymentRequest')
    .whereIn('use_case', [
      'Threat Profiling (CTI)',
      'Threat Profiling (FIMI)',
      'Threat Profiling (Law enforcement)',
      'Threat Profiling (Fraud & AML)',
      'Threat Hunting',
      'Strategic Reporting (For Executives)',
      'Technical Reporting (for Analysts)',
      'Coordinating Incident Response',
      'Integrating Security Stack',
      'Detection Engineering',
      'Simulating Cyber Attacks',
      'Simulating Crisis (Tabletop Exercises)',
      'Vulnerability Management',
      'Centralizing Knowledge',
      'Sharing Knowledge',
      'Hosting Threat Sharing Community',
    ])
    .update({
      use_case: knex.raw(`CASE
        WHEN use_case = 'Threat Profiling (CTI)' THEN 'threat_profiling_cti'
        WHEN use_case = 'Threat Profiling (FIMI)' THEN 'threat_profiling_fimi'
        WHEN use_case = 'Threat Profiling (Law enforcement)' THEN 'threat_profiling_leo'
        WHEN use_case = 'Threat Profiling (Fraud & AML)' THEN 'threat_profiling_faml'
        WHEN use_case = 'Threat Hunting' THEN 'threat_hunting'
        WHEN use_case = 'Strategic Reporting (For Executives)' THEN 'strategic_reporting'
        WHEN use_case = 'Technical Reporting (for Analysts)' THEN 'technical_reporting'
        WHEN use_case = 'Coordinating Incident Response' THEN 'incident_response'
        WHEN use_case = 'Integrating Security Stack' THEN 'security_stack'
        WHEN use_case = 'Detection Engineering' THEN 'detection_engineering'
        WHEN use_case = 'Simulating Cyber Attacks' THEN 'attack_simulation'
        WHEN use_case = 'Simulating Crisis (Tabletop Exercises)' THEN 'crisis_simulation'
        WHEN use_case = 'Vulnerability Management' THEN 'vulnerability_management'
        WHEN use_case = 'Centralizing Knowledge' THEN 'centralizing_knowledge'
        WHEN use_case = 'Sharing Knowledge' THEN 'sharing_knowledge'
        WHEN use_case = 'Hosting Threat Sharing Community' THEN 'hosting_threat_community'
      END`),
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('DeploymentRequest')
    .whereIn('use_case', [
      'threat_profiling_cti',
      'threat_profiling_fimi',
      'threat_profiling_leo',
      'threat_profiling_faml',
      'threat_hunting',
      'strategic_reporting',
      'technical_reporting',
      'incident_response',
      'security_stack',
      'detection_engineering',
      'attack_simulation',
      'crisis_simulation',
      'vulnerability_management',
      'centralizing_knowledge',
      'sharing_knowledge',
      'hosting_threat_community',
    ])
    .update({
      use_case: knex.raw(`CASE
        WHEN use_case = 'threat_profiling_cti' THEN 'Threat Profiling (CTI)'
        WHEN use_case = 'threat_profiling_fimi' THEN 'Threat Profiling (FIMI)'
        WHEN use_case = 'threat_profiling_leo' THEN 'Threat Profiling (Law enforcement)'
        WHEN use_case = 'threat_profiling_faml' THEN 'Threat Profiling (Fraud & AML)'
        WHEN use_case = 'threat_hunting' THEN 'Threat Hunting'
        WHEN use_case = 'strategic_reporting' THEN 'Strategic Reporting (For Executives)'
        WHEN use_case = 'technical_reporting' THEN 'Technical Reporting (for Analysts)'
        WHEN use_case = 'incident_response' THEN 'Coordinating Incident Response'
        WHEN use_case = 'security_stack' THEN 'Integrating Security Stack'
        WHEN use_case = 'detection_engineering' THEN 'Detection Engineering'
        WHEN use_case = 'attack_simulation' THEN 'Simulating Cyber Attacks'
        WHEN use_case = 'crisis_simulation' THEN 'Simulating Crisis (Tabletop Exercises)'
        WHEN use_case = 'vulnerability_management' THEN 'Vulnerability Management'
        WHEN use_case = 'centralizing_knowledge' THEN 'Centralizing Knowledge'
        WHEN use_case = 'sharing_knowledge' THEN 'Sharing Knowledge'
        WHEN use_case = 'hosting_threat_community' THEN 'Hosting Threat Sharing Community'
      END`),
    });
}
