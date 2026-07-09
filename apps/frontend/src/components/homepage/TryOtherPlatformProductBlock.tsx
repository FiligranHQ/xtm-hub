'use client';

import { resolveHomepageCrossSellProduct } from '@/components/homepage/Homepage.utils';
import { PortalContext } from '@/components/me/AppPortalContext';
import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { Button, Card, CardContent } from '@filigran/ui';
import {
  PlatformIdentifier,
  TrialDeploymentsEligibilityQueryVariables,
  useTrialDeploymentsEligibilityQuery,
} from '@graphql/generated';
import { trialKeys } from '@graphql/trial/trial.keys';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useContext } from 'react';

const TryOtherPlatformProductBlock = () => {
  const t = useTranslations('HomePage.TryOtherPlatform');
  const { me } = useContext(PortalContext);
  const selectedOrganizationId = me?.selected_organization_id;

  const variables: TrialDeploymentsEligibilityQueryVariables = {
    input: {
      organizationId: selectedOrganizationId ?? '',
      platformIdentifiers: [
        PlatformIdentifier.Opencti,
        PlatformIdentifier.Openaev,
      ],
    },
  };

  const { data } = useTrialDeploymentsEligibilityQuery(
    portalGraphqlClient,
    variables,
    {
      enabled: !!selectedOrganizationId,
      queryKey: trialKeys.trialDeploymentsEligibility(variables),
    }
  );

  const product = resolveHomepageCrossSellProduct(data?.trialDeployments);
  if (!product) {
    return null;
  }

  const { learnMorePrivateUrl, name, Icon } = PlatformMetadataMapping[product];

  return (
    <Card className="bg-elevation-background-layer-3 pt-l mt-xxl border-none rounded-xl">
      <CardContent className="p-l flex flex-col gap-xl md:justify-between">
        <h2 className="font-semibold">{t('Title')}</h2>
        <Button
          asChild
          variant="outline"
          className="font-semibold w-full border-elevation-border-strong-layer-3">
          <Link
            href={learnMorePrivateUrl}
            className="inline-flex items-center gap-xs text-primary">
            <Icon className="size-4" />
            {t(`Cta`, { productName: name })}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default TryOtherPlatformProductBlock;
