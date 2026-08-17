import { useOrganizationCapabilities } from '@/hooks/use-organization-capabilities';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@filigran/ui/servers';
import { useTranslate } from '@tolgee/react';
import { useMemo } from 'react';

export const CapabilityDescription = () => {
  const { t } = useTranslate();

  const buildTranslationKey = (capability: string) =>
    `CapabilityDescription.Capabilities.${capability}`;

  const organizationCapabilities = useOrganizationCapabilities();

  const capabilityList = useMemo(() => {
    return organizationCapabilities
      .filter((capability) => {
        return t(buildTranslationKey(capability));
      })
      .map((capability) => {
        return (
          <li
            className="flex items-center"
            key={capability}>
            <span className="min-w-56">
              <Badge>{capability.replaceAll('_', ' ')}</Badge>
            </span>
            <span>{t(buildTranslationKey(capability))}</span>
          </li>
        );
      });
  }, [t, organizationCapabilities]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-lg">
          {t('CapabilityDescription_Title')}
        </CardTitle>
        <CardDescription>
          {t('CapabilityDescription_Description')}
        </CardDescription>
        <CardContent className="p-0">
          <ul className="flex flex-col space-y-s gap-xs text-xs">
            {capabilityList}
          </ul>
        </CardContent>
      </CardHeader>
    </Card>
  );
};
