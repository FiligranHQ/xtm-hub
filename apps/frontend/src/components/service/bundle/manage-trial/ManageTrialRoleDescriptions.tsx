'use client';

import { InfoIcon } from '@filigran/icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@filigran/ui';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';

interface RolePanelConfig {
  platform: PlatformIdentifier;
  roles: string[];
}

const ROLE_PANELS: RolePanelConfig[] = [
  {
    platform: PlatformIdentifier.Opencti,
    roles: ['Admin', 'Analyst', 'Reader'],
  },
  {
    platform: PlatformIdentifier.Openaev,
    roles: ['Admin', 'Manager', 'Observer'],
  },
  {
    platform: PlatformIdentifier.Xtmone,
    roles: ['Admin', 'User'],
  },
];

export const ManageTrialRoleDescriptions = () => {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-1 gap-l md:grid-cols-3">
      {ROLE_PANELS.map(({ platform, roles }) => {
        const namespace = `Service.Bundle.ManageTrial.Roles.${platform}`;

        return (
          <Accordion
            key={platform}
            type="single"
            collapsible>
            <AccordionItem value={platform}>
              <AccordionTrigger className="border-b border-elevation-border-default-layer-0 py-s pr-0 hover:no-underline cursor-pointer data-[state=open]:border-b-0">
                <span className="flex items-center gap-xs">
                  <InfoIcon className="h-4 w-4 shrink-0" />
                  {t(`${namespace}.Title`)}
                </span>
              </AccordionTrigger>
              <AccordionContent className="py-s border-b border-elevation-border-default-layer-0 flex flex-col gap-s">
                {roles.map((role) => (
                  <p
                    key={role}
                    className="text-content-body-compact">
                    <span className="font-bold text-text-default-primary">
                      {t(`${namespace}.${role}.Label`)}:{' '}
                    </span>
                    {t(`${namespace}.${role}.Description`)}
                  </p>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
};
