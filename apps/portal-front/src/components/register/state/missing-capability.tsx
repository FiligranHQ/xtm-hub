import { RegisterStateLayout } from '@/components/register/state/layout';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useLazyLoadQuery } from 'react-relay';

interface Props {
  cancel: () => void;
  organizationId: string;
}

export const RegisterStateMissingCapability: React.FC<Props> = ({
  organizationId,
  cancel,
}) => {
  const t = useTranslations();
  const { organizationAdministrators } =
    useLazyLoadQuery<userListOrganizationAdministratorsQuery>(
      UserListOrganizationAdministratorsQueryGraphql,
      { organizationId }
    );

  return (
    <RegisterStateLayout cancel={cancel}>
      <h1>
        {t('Register.OCTI.Error.Capability.Title', {
          capability:
            OrganizationCapabilityEnum.MANAGE_OPENCTI_REGISTRATION.replaceAll(
              '_',
              ' '
            ),
        })}
      </h1>
      <p>{t('Register.OCTI.Error.Capability.Description')}</p>
      <p>{t('Register.OCTI.Error.Capability.AdminListTitle')}</p>
      <ul className="list-disc ml-l">
        {organizationAdministrators.map((administrator) => (
          <li key={administrator.id}>
            {administrator.first_name} {administrator.last_name} -{' '}
            {administrator.email}
          </li>
        ))}
      </ul>
    </RegisterStateLayout>
  );
};
