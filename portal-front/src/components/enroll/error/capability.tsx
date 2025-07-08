import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

interface Props {
  queryRef: PreloadedQuery<userListOrganizationAdministratorsQuery>;
}

export const EnrollErrorCapability: React.FC<Props> = ({ queryRef }) => {
  const t = useTranslations();
  const query = usePreloadedQuery<userListOrganizationAdministratorsQuery>(
    UserListOrganizationAdministratorsQueryGraphql,
    queryRef
  );

  const back = () => {
    window.postMessage('cancel');
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex flex-col gap-m">
        <h1>
          {t('Enroll.OCTI.Error.Capability.Title', {
            capability:
              OrganizationCapabilityEnum.MANAGE_OCTI_ENROLLMENT.replaceAll(
                '_',
                ' '
              ),
          })}
        </h1>
        <p>{t('Enroll.OCTI.Error.Capability.Description')}</p>
        <p>{t('Enroll.OCTI.Error.Capability.AdminListTitle')}</p>
        <ul className="list-disc ml-l">
          {query.organizationAdministrators.map((administrator) => (
            <li key={administrator.id}>
              {administrator.first_name} {administrator.last_name} -{' '}
              {administrator.email}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end">
        <Button onClick={back}>Back to OCTI</Button>
      </div>
    </div>
  );
};
