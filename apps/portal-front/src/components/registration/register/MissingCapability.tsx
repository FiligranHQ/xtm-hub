import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import UserWithCapabilitiesInOrganizationQueryGraphql, {
  userWithCapabilitiesInOrganizationQuery,
} from '@generated/userWithCapabilitiesInOrganizationQuery.graphql';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { RegistrationContext } from '../Context';
import { RegistrationLayout } from '../Layout';

interface Props {
  cancel: () => void;
  organizationId: string;
}

export const RegisterStateMissingCapability: React.FC<Props> = ({
  organizationId,
  cancel,
}) => {
  const { capability, displayedIdentifier } = useContext(RegistrationContext);
  const t = useTranslations();
  const capabilities = [OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION];
  if (capability) {
    capabilities.push(capability);
  }

  const { usersWithCapabilitiesInOrganization } =
    useLazyLoadQuery<userWithCapabilitiesInOrganizationQuery>(
      UserWithCapabilitiesInOrganizationQueryGraphql,
      {
        input: {
          organizationId,
          capabilities,
        },
      }
    );

  return (
    <RegistrationLayout cancel={cancel}>
      <h1>
        {t(`Register.Error.Capability.Title`, {
          capability: capability?.replaceAll('_', ' ') ?? '',
        })}
      </h1>
      <p>
        {t(`Register.Error.Capability.Description`, {
          platformIdentifier: displayedIdentifier,
        })}
      </p>
      <p>{t(`Register.Error.Capability.AdminListTitle`)}</p>
      <ul className="list-disc ml-l">
        {usersWithCapabilitiesInOrganization.map((administrator) => (
          <li key={administrator.id}>
            {administrator.first_name} {administrator.last_name} -{' '}
            {administrator.email}
          </li>
        ))}
      </ul>
    </RegistrationLayout>
  );
};
