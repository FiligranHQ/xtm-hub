import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import {
  AttackPatternIcon,
  ExtensionIcon,
  InsertChartIcon,
  InsightsIcon,
  LibraryBooksIcon,
  LogoFiligranIcon,
} from '@filigran/icon';
import { FunctionComponent, SVGProps } from 'react';

type IconComponent = FunctionComponent<SVGProps<SVGSVGElement>>;

const RESOURCE_TYPE_ICON: Record<ShareableResourceType, IconComponent> = {
  [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]: InsertChartIcon,
  [ShareableResourceType.OPENCTI_CUSTOM_VIEW]: InsightsIcon,
  [ShareableResourceType.OPENCTI_PLAYBOOK]: LibraryBooksIcon,
  [ShareableResourceType.OPENCTI_INTEGRATION]: ExtensionIcon,
  [ShareableResourceType.OPENAEV_SCENARIO]: AttackPatternIcon,
};

interface ResourceTypeIconProps extends SVGProps<SVGSVGElement> {
  resourceType: string;
}

export const ResourceTypeIcon = ({
  resourceType,
  ...props
}: ResourceTypeIconProps) => {
  const Icon =
    RESOURCE_TYPE_ICON[resourceType as ShareableResourceType] ??
    LogoFiligranIcon;
  return <Icon {...props} />;
};
