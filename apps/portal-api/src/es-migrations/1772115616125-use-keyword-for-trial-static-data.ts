'use strict';

import { esDbClient } from '../thirdparty/elasticsearch/client.js';
import { logApp } from '../utils/app-logger.util';

export const up = async function (next) {
  const mapping = {
    'Threat Profiling (CTI)': 'threat_profiling_cti',
    'Threat Profiling (FIMI)': 'threat_profiling_fimi',
    'Threat Profiling (Law enforcement)': 'threat_profiling_leo',
    'Threat Profiling (Fraud & AML)': 'threat_profiling_faml',
    'Threat Hunting': 'threat_hunting',
    'Strategic Reporting (For Executives)': 'strategic_reporting',
    'Technical Reporting (for Analysts)': 'technical_reporting',
    'Coordinating Incident Response': 'incident_response',
    'Integrating Security Stack': 'security_stack',
    'Detection Engineering': 'detection_engineering',
    'Simulating Cyber Attacks': 'attack_simulation',
    'Simulating Crisis (Tabletop Exercises)': 'crisis_simulation',
    'Vulnerability Management': 'vulnerability_management',
    'Centralizing Knowledge': 'centralizing_knowledge',
    'Sharing Knowledge': 'sharing_knowledge',
    'Hosting Threat Sharing Community': 'hosting_threat_community',
  };

  for (const [label, keyword] of Object.entries(mapping)) {
    try {
      await esDbClient.updateByQuery({
        index: 'telemetry_v1',
        refresh: true,
        conflicts: 'proceed',
        script: {
          source: 'ctx._source.use_case = params.keyword',
          params: { keyword },
        },
        query: {
          term: { 'use_case.keyword': label },
        },
      });
    } catch (error) {
      logApp.error(`Error updating use_case from '${label}' to '${keyword}'`, {
        error,
      });
    }
  }
  next();
};

export const down = async function (next) {
  const reverseMapping = {
    threat_profiling_cti: 'Threat Profiling (CTI)',
    threat_profiling_fimi: 'Threat Profiling (FIMI)',
    threat_profiling_leo: 'Threat Profiling (Law enforcement)',
    threat_profiling_faml: 'Threat Profiling (Fraud & AML)',
    threat_hunting: 'Threat Hunting',
    strategic_reporting: 'Strategic Reporting (For Executives)',
    technical_reporting: 'Technical Reporting (for Analysts)',
    incident_response: 'Coordinating Incident Response',
    security_stack: 'Integrating Security Stack',
    detection_engineering: 'Detection Engineering',
    attack_simulation: 'Simulating Cyber Attacks',
    crisis_simulation: 'Simulating Crisis (Tabletop Exercises)',
    vulnerability_management: 'Vulnerability Management',
    centralizing_knowledge: 'Centralizing Knowledge',
    sharing_knowledge: 'Sharing Knowledge',
    hosting_threat_community: 'Hosting Threat Sharing Community',
  };

  for (const [keyword, label] of Object.entries(reverseMapping)) {
    try {
      await esDbClient.updateByQuery({
        index: 'telemetry_v1',
        refresh: true,
        conflicts: 'proceed',
        script: {
          source: 'ctx._source.use_case = params.label',
          params: { label },
        },
        query: {
          term: { 'use_case.keyword': keyword },
        },
      });
    } catch (error) {
      logApp.error(`Error reverting use_case from '${keyword}' to '${label}'`, {
        error,
      });
    }
  }
  next();
};
