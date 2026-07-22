import { LogoFiligranIcon } from '@filigran/icon';
import {
  AccountBalanceOutlined,
  BiotechOutlined,
  BugReportOutlined,
  DescriptionOutlined,
  DiamondOutlined,
  DomainOutlined,
  EventOutlined,
  FlagOutlined,
  HelpOutlined,
  MapOutlined,
  PersonOutlined,
  PlaceOutlined,
  PublicOutlined,
  RouterOutlined,
  SecurityOutlined,
  SpeakerNotesOutlined,
  StorageOutlined,
  StreamOutlined,
  SurroundSoundOutlined,
  SvgIconComponent,
  WebAssetOutlined,
  WorkspacesOutlined,
} from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';
import {
  AccountMultipleOutline,
  ArchiveOutline,
  Biohazard,
  BriefcaseEditOutline,
  BriefcaseRemoveOutline,
  BriefcaseSearchOutline,
  ChessKnight,
  Fire,
  HexagonOutline,
  LaptopAccount,
  LockPattern,
} from 'mdi-material-ui';

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
 * Map each entity type to the exact OpenCTI icon, using the same MUI / MDI
 * components as the platform's `ItemIcon` (`iconSelector`) so the icons match
 * OpenCTI
 */
const ENTITY_TYPE_ICON: Record<string, SvgIconComponent> = {
  'Administrative-Area': MapOutlined,
  Channel: SurroundSoundOutlined,
  City: PlaceOutlined,
  Country: FlagOutlined,
  'Data-Source': StreamOutlined,
  Event: EventOutlined,
  Grouping: WorkspacesOutlined,
  Individual: PersonOutlined,
  Infrastructure: RouterOutlined,
  'Intrusion-Set': DiamondOutlined,
  'Malware-Analysis': BiotechOutlined,
  Narrative: SpeakerNotesOutlined,
  Organization: AccountBalanceOutlined,
  Region: PublicOutlined,
  Report: DescriptionOutlined,
  Sector: DomainOutlined,
  SecurityPlatform: SecurityOutlined,
  System: StorageOutlined,
  Tool: WebAssetOutlined,
  Vulnerability: BugReportOutlined,
  Artifact: ArchiveOutline,
  'Attack-Pattern': LockPattern,
  Campaign: ChessKnight,
  'Case-Rfi': BriefcaseSearchOutline,
  'Case-Rft': BriefcaseRemoveOutline,
  Feedback: BriefcaseEditOutline,
  Incident: Fire,
  Malware: Biohazard,
  'Stix-Cyber-Observable': HexagonOutline,
  'Threat-Actor-Group': AccountMultipleOutline,
  'Threat-Actor-Individual': LaptopAccount,
};

/**
 * Map each entity type to its OpenCTI color. Values mirror the OpenCTI color
 * families (see `itemColor` / `COLOR_FAMILIES` in the platform) so icons look
 * consistent with the platform.
 */
const ENTITY_TYPE_COLOR: Record<string, string> = {
  Report: '#70B23B',
  Grouping: '#70B23B',
  'Malware-Analysis': '#70B23B',
  'Case-Rfi': '#EA80FC',
  'Case-Rft': '#EA80FC',
  Feedback: '#EA80FC',
  Incident: '#F96C9B',
  Artifact: '#FF6F42',
  Infrastructure: '#FF6F42',
  'Threat-Actor-Group': '#FF9800',
  'Threat-Actor-Individual': '#FF9800',
  'Intrusion-Set': '#FF9800',
  Campaign: '#FF9800',
  Malware: '#F0B60A',
  Channel: '#F0B60A',
  Tool: '#F0B60A',
  Vulnerability: '#F0B60A',
  SecurityPlatform: '#F0B60A',
  'Attack-Pattern': '#D3E157',
  Narrative: '#D3E157',
  'Data-Source': '#D3E157',
  Sector: '#BA88FF',
  Event: '#BA88FF',
  Organization: '#BA88FF',
  System: '#BA88FF',
  Individual: '#BA88FF',
  Region: '#05ACC1',
  Country: '#05ACC1',
  'Administrative-Area': '#05ACC1',
  City: '#05ACC1',
  'Stix-Cyber-Observable': '#84ffff',
};

export const getEntityTypeLabel = (id: string): string =>
  ENTITY_TYPE_BY_ID[id]?.name ?? id;

interface EntityTypeIconProps extends SvgIconProps {
  entityType: string;
}

/** Renders the OpenCTI icon for an entity type, with a generic fallback. */
export const EntityTypeIcon = ({
  entityType,
  sx,
  ...props
}: EntityTypeIconProps) => {
  const Icon: SvgIconComponent = ENTITY_TYPE_ICON[entityType] ?? HelpOutlined;
  const color = ENTITY_TYPE_COLOR[entityType];
  return (
    <Icon
      sx={{ color, ...sx }}
      {...props}
    />
  );
};

interface EntityTypeOrFiligranLogoProps {
  entityTypes?: readonly string[] | null;
  className?: string;
}

/**
 * Renders the icon of the first entity type as the resource's default logo,
 * falling back to the Filigran logo when no entity type is available. The entity
 * icon is a MUI SvgIcon: it is sized via `fontSize`
 */
export const EntityTypeOrFiligranLogo = ({
  entityTypes,
  className,
}: EntityTypeOrFiligranLogoProps) => {
  const first = entityTypes?.[0];
  return first ? (
    <EntityTypeIcon
      entityType={first}
      sx={{ fontSize: '5.5rem' }}
    />
  ) : (
    <LogoFiligranIcon className={className} />
  );
};
