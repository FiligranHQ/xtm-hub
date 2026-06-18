import {
  AdministrativeAreaIcon,
  AttackPatternIcon,
  CampaignIcon,
  ChannelIcon,
  CityIcon,
  CountryIcon,
  DataSourceIcon,
  EventIcon,
  GroupingIcon,
  IncidentIcon,
  IndividualIcon,
  InfrastructureIcon,
  IntrusionSetIcon,
  LabelIcon,
  MalwareAnalysisIcon,
  MalwareIcon,
  NarrativeIcon,
  ObservedDataIcon,
  OrganizationIcon,
  ReportIcon,
  SectorIcon,
  SystemIcon,
  ThreatActorGroupIcon,
  ThreatActorIndividualIcon,
  ToolIcon,
  VulnerabilityIcon,
} from '@filigran/icon';
import { FunctionComponent, SVGProps } from 'react';

type IconComponent = FunctionComponent<SVGProps<SVGSVGElement>>;

interface EntityTypeOption {
  /** Canonical OpenCTI entity type value, stored in the database. */
  id: string;
  /** Human-readable label displayed to the user. */
  name: string;
}

/**
 * Applicable OpenCTI entity types for Custom Views, in the order defined by the
 * product spec. Values match the canonical OpenCTI entity type identifiers so
 * the library stays consistent with the platform.
 * NB: "Security Coverages" is intentionally excluded (marked as "later").
 */
export const ENTITY_TYPES: EntityTypeOption[] = [
  { id: 'Administrative-Area', name: 'Area' },
  { id: 'Artifact', name: 'Artifact' },
  { id: 'Attack-Pattern', name: 'Attack Pattern' },
  { id: 'Campaign', name: 'Campaign' },
  { id: 'Channel', name: 'Channel' },
  { id: 'City', name: 'City' },
  { id: 'Country', name: 'Country' },
  { id: 'Data-Source', name: 'Data Source' },
  { id: 'Event', name: 'Event' },
  { id: 'Feedback', name: 'Feedback' },
  { id: 'Grouping', name: 'Grouping' },
  { id: 'Incident', name: 'Incident' },
  { id: 'Individual', name: 'Individual' },
  { id: 'Infrastructure', name: 'Infrastructure' },
  { id: 'Intrusion-Set', name: 'Intrusion Set' },
  { id: 'Malware', name: 'Malware' },
  { id: 'Malware-Analysis', name: 'Malware Analysis' },
  { id: 'Narrative', name: 'Narrative' },
  { id: 'Stix-Cyber-Observable', name: 'Observable' },
  { id: 'Organization', name: 'Organization' },
  { id: 'Region', name: 'Region' },
  { id: 'Report', name: 'Report' },
  { id: 'Case-Rfi', name: 'Request for information' },
  { id: 'Case-Rft', name: 'Request for takedown' },
  { id: 'Sector', name: 'Sector' },
  { id: 'SecurityPlatform', name: 'Security platform' },
  { id: 'System', name: 'System' },
  { id: 'Threat-Actor-Group', name: 'Threat Actor (Group)' },
  { id: 'Threat-Actor-Individual', name: 'Threat Actor (Individual)' },
  { id: 'Tool', name: 'Tool' },
  { id: 'Vulnerability', name: 'Vulnerability' },
];

const ENTITY_TYPE_BY_ID: Record<string, EntityTypeOption> = Object.fromEntries(
  ENTITY_TYPES.map((entityType) => [entityType.id, entityType])
);

/**
 * Map each entity type to its OpenCTI icon when available. Entity types without
 * a dedicated icon fall back to a generic one (see {@link EntityTypeIcon}).
 */
const ENTITY_TYPE_ICON: Record<string, IconComponent> = {
  'Administrative-Area': AdministrativeAreaIcon,
  'Attack-Pattern': AttackPatternIcon,
  Campaign: CampaignIcon,
  Channel: ChannelIcon,
  City: CityIcon,
  Country: CountryIcon,
  'Data-Source': DataSourceIcon,
  Event: EventIcon,
  Grouping: GroupingIcon,
  Incident: IncidentIcon,
  Individual: IndividualIcon,
  Infrastructure: InfrastructureIcon,
  'Intrusion-Set': IntrusionSetIcon,
  Malware: MalwareIcon,
  'Malware-Analysis': MalwareAnalysisIcon,
  Narrative: NarrativeIcon,
  'Stix-Cyber-Observable': ObservedDataIcon,
  Organization: OrganizationIcon,
  Report: ReportIcon,
  Sector: SectorIcon,
  System: SystemIcon,
  'Threat-Actor-Group': ThreatActorGroupIcon,
  'Threat-Actor-Individual': ThreatActorIndividualIcon,
  Tool: ToolIcon,
  Vulnerability: VulnerabilityIcon,
};

export const getEntityTypeLabel = (id: string): string =>
  ENTITY_TYPE_BY_ID[id]?.name ?? id;

interface EntityTypeIconProps extends SVGProps<SVGSVGElement> {
  entityType: string;
}

/** Renders the OpenCTI icon for an entity type, with a generic fallback. */
export const EntityTypeIcon = ({
  entityType,
  ...props
}: EntityTypeIconProps) => {
  const Icon = ENTITY_TYPE_ICON[entityType] ?? LabelIcon;
  return <Icon {...props} />;
};
