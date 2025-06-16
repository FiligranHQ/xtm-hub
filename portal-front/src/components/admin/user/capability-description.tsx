import { SettingsContext } from '@/components/settings/env-portal-context';
import { OrganizationCapabilityName } from '@/utils/constant';
import { isOCTIEnrollmentEnabled } from '@/utils/isFeatureEnabled';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React, { useContext, useMemo } from 'react';

export const CapabilityDescription: React.FC = () => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);

  const buildTranslationKey = (capability: string) =>
    `CapabilityDescription.Capabilities.${capability}`;

  const capabilityList = useMemo(() => {
    return Object.values(OrganizationCapabilityName)
      .filter((capability) => {
        const shouldDisplayCapability =
          capability != OrganizationCapabilityName.MANAGE_OCTI_ENROLLMENT ||
          isOCTIEnrollmentEnabled(settings);
        const hasTranslation = t.has(buildTranslationKey(capability));
        return shouldDisplayCapability && hasTranslation;
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
  }, [settings, t, OrganizationCapabilityName]);

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
