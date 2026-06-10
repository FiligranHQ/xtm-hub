'use client';

import OrganizationSubscribedServicesSlug from '@/components/organization/[slug]/subscribed-services/OrganizationSubscribedServices';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { APP_PATH } from '@/utils/path/constant';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const baseBreadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Organization',
    href: `/${APP_PATH}/admin/organizations`,
  },
];

// Component interface
interface PreloaderProps {
  id: string;
}

interface OrganizationBreadcrumbQueryData {
  organization: {
    id: string;
    name: string;
  } | null;
}

const organizationBreadcrumbQuery = gql`
  query OrganizationBreadcrumbQuery($id: ID!) {
    organization(id: $id) {
      id
      name
    }
  }
`;

// Component
const PageLoader = ({ id }: PreloaderProps) => {
  const t = useTranslations();
  const { data: organizationData } = useQuery({
    queryKey: ['organization-breadcrumb', id],
    queryFn: () =>
      portalGraphqlClient.request<OrganizationBreadcrumbQueryData>(
        organizationBreadcrumbQuery,
        { id }
      ),
  });
  const organizationLabel = organizationData?.organization?.name ?? id;

  const breadcrumbValue = useMemo(() => {
    return [
      ...baseBreadcrumbValue,
      { label: organizationLabel, original: true },
      { label: 'Service.SubscribedServices' },
    ];
  }, [organizationLabel]);

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('Service.SubscribedServices')}</h1>
      <OrganizationSubscribedServicesSlug organizationId={id} />
    </>
  );
};

// Component export
export default PageLoader;
