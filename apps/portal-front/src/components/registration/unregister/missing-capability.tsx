import { RegistrationContext } from '@/components/registration/context';
import { RegistrationLayout } from '@/components/registration/layout';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';
import { useLazyLoadQuery } from 'react-relay';

interface Props {
  cancel: () => void;
  organizationId: string;
}

export const UnregisterOpenCTIMissingCapability: React.FC<Props> = ({
  cancel,
  organizationId,
}) => {
  const { capability, translationKey } = useContext(RegistrationContext);
  const t = useTranslations();
  const { organizationAdministrators } =
    useLazyLoadQuery<userListOrganizationAdministratorsQuery>(
      UserListOrganizationAdministratorsQueryGraphql,
      { organizationId }
    );

  return (
    <RegistrationLayout cancel={cancel}>
      <h1>
        {t(`Unregister.${translationKey}.Error.Capability.Title`, {
          capability: capability?.replaceAll('_', ' ') ?? '',
        })}
      </h1>
      <p>{t(`Unregister.${translationKey}.Error.Capability.Description`)}</p>
      <p>{t(`Unregister.${translationKey}.Error.Capability.AdminListTitle`)}</p>
      <ul className="list-disc ml-l">
        {organizationAdministrators.map((administrator) => (
          <li key={administrator.id}>
            {administrator.first_name} {administrator.last_name} -{' '}
            {administrator.email}
          </li>
        ))}
      </ul>
    </RegistrationLayout>
  );
};
