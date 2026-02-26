import { DeploymentRequestPlatformRegionEnum } from '@generated/models/DeploymentRequestPlatformRegion.enum';

export const REGIONS_VALUES = Object.values(
  DeploymentRequestPlatformRegionEnum
);
export const REGIONS = Object.values(DeploymentRequestPlatformRegionEnum).map(
  (region) => ({
    value: region,
    label: region.toUpperCase(),
  })
);
export const JOB_TITLES = [
  'CEO',
  'CISO/CSO/CIO',
  'C-level',
  'General Manager/Vice President',
  'Director/Head of Cybersecurity',
  'Cybersecurity Team Lead',
  'Application Security Specialist',
  'Cloud Security Specialit',
  'Cybersecurity Architect',
  'Cybersecurity Engineer',
  'Digital Forensics and Incident Response Specialist',
  'Governance, Risk, and Compliance Specialist',
  'Identity and Access Management Specialist',
  'Penetration Tester',
  'Security Operations Center (SOC) Analyst',
  'Threat Intelligence Analyst',
  'Vulnerability Analyst',
  'Consultant',
  'Other',
] as const;

export const ACTIVITIES_SECTOR = [
  'Computer & Network Security',
  'Computer Games',
  'Computer Software',
  'Defense & Space',
  'Entertainment',
  'Financial Services',
  'Government Administration',
  'Government Relations',
  'Higher Education',
  'Hospital & Health Care',
  'Hospitality',
  'Information Technology and Services',
  'Insurance',
  'Legal Services',
  'Luxury Goods & Jewelry',
  'Management Consulting',
  'Marketing and Advertising',
  'Military',
  'Non-Profit Organization Management',
  'Oil & Energy',
  'Pharmaceuticals',
  'Photography',
  'Retail',
  'Security and Investigations',
  'Semiconductors',
  'Telecommunications',
  'Transportation/Trucking/Railroad',
  'Utilities',
  'Wireless',
] as const;
