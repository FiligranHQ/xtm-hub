'use client';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { useLoadGrafanaTokenQuery } from '@graphql/generated';

// Component
const Page = () => {
  const { data: queryData, isError } = useLoadGrafanaTokenQuery(
    portalGraphqlClient,
    {}
  );

  if (isError) return <div>{'Error loading Grafana token'}</div>;

  const token = queryData?.loadGrafanaToken;
  const GRAFANA_BASE_URL = 'http://localhost:3000';
  const DASHBOARD_UID = 'adjdb77';
  const DASHBOARD_SLUG = 'new-dashboard';

  const embedUrl = `${GRAFANA_BASE_URL}/d/${DASHBOARD_UID}/${DASHBOARD_SLUG}?orgId=1&kiosk=1&auth_token=${token}`;
  return (
    <>
      {'Coucou'}
      <iframe
        src={embedUrl}
        width="100%"
        height="600px"
        frameBorder="0"
        style={{ border: 'none' }}
      />
    </>
  );
};

// Component export
export default Page;
