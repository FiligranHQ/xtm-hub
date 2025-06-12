import { OrganizationCapabilityName } from '@/utils/constant';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

export const CapabilityDescription: React.FC = () => {
  const t = useTranslations();

  const buildTranslationKey = (capability: string) =>
    `CapabilityDescription.Capabilities.${capability}`;

  const capabilityList = useMemo(() => {
    return Object.values(OrganizationCapabilityName)
      .filter((capability) => {
        return t.has(buildTranslationKey(capability));
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
  }, [t, OrganizationCapabilityName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('CapabilityDescription.Title')}</CardTitle>
        <CardDescription>
          {t('CapabilityDescription.Description')}
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
