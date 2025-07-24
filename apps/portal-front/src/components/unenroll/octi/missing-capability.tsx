import { EnrollStateLayout } from '@/components/enroll/state/layout';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import { useTranslations } from 'next-intl';
import React from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

interface Props {
  cancel: () => void;
  queryRef: PreloadedQuery<userListOrganizationAdministratorsQuery>;
}

export const UnenrollOCTIMissingCapability: React.FC<Props> = ({
  cancel,
  queryRef,
}) => {
  const t = useTranslations();
  const query = usePreloadedQuery<userListOrganizationAdministratorsQuery>(
    UserListOrganizationAdministratorsQueryGraphql,
    queryRef
  );

  return (
    <EnrollStateLayout cancel={cancel}>
      <h1>
        {t('Unenroll.OCTI.Error.Capability.Title', {
          capability:
            OrganizationCapabilityEnum.MANAGE_OCTI_ENROLLMENT.replaceAll(
              '_',
              ' '
            ),
        })}
      </h1>
      <p>{t('Unenroll.OCTI.Error.Capability.Description')}</p>
      <p>{t('Unenroll.OCTI.Error.Capability.AdminListTitle')}</p>
      <ul className="list-disc ml-l">
        {query.organizationAdministrators.map((administrator) => (
          <li key={administrator.id}>
            {administrator.first_name} {administrator.last_name} -{' '}
            {administrator.email}
          </li>
        ))}
      </ul>
    </EnrollStateLayout>
  );
};
