import { buildDistinctPlatformIdentifiersFromServiceDefinition } from '@/components/homepage/Homepage.utils';
import LastDeployedResourcesClient from '@/components/homepage/LastDeployedResourcesClient';
import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import {
  LastDeployedOverviewQueryQuery,
  PlatformIdentifier,
  RegisteredPlatformsQuery,
  useLastDeployedOverviewQueryQuery,
} from '@graphql/generated';

const LAST_DEPLOYED_LIMIT = 4;

const SUPPORTED_PRODUCTS: PlatformIdentifier[] = [
  PlatformIdentifier.Opencti,
  PlatformIdentifier.Openaev,
];

export type LastDeployedOverview =
  LastDeployedOverviewQueryQuery['lastDeployedOverview'];

type LastDeployedResourcesSectionProps = {
  registeredPlatformsData: RegisteredPlatformsQuery;
};

export const LastDeployedResourcesSection = async ({
  registeredPlatformsData,
}: LastDeployedResourcesSectionProps) => {
  const products = buildDistinctPlatformIdentifiersFromServiceDefinition(
    registeredPlatformsData.registeredPlatforms
  ).filter((product) => SUPPORTED_PRODUCTS.includes(product));

  if (products.length === 0) {
    return null;
  }

  const client = await getAuthenticatedGraphqlClient();

  const entries = await Promise.all(
    products.map(async (product) => {
      const data = await useLastDeployedOverviewQueryQuery.fetcher(client, {
        limit: LAST_DEPLOYED_LIMIT,
        platformIdentifiers: [product],
      })();
      return [product, data.lastDeployedOverview] as const;
    })
  );

  const overviewByProduct = Object.fromEntries(entries) as Partial<
    Record<PlatformIdentifier, LastDeployedOverview>
  >;

  return (
    <LastDeployedResourcesClient
      products={products}
      overviewByProduct={overviewByProduct}
    />
  );
};

export default LastDeployedResourcesSection;
