import { db } from './db-connection';
import { DocumentNode } from 'graphql/language';
import { ApiClient } from '../tests_files/api/client';
import { expect } from '../fixtures/baseFixtures';

interface CheckCapabilityParams {
  loginUserEmail: string;
  organizationName: string;
  requiredCapability?: string;
  capabilityBlackList?: string[];
  shouldBeAuthorized: boolean;
  query: DocumentNode;
  variables: Record<string, unknown>;
}

export const checkCapability = async ({
  loginUserEmail,
  organizationName,
  requiredCapability,
  capabilityBlackList,
  shouldBeAuthorized,
  query,
  variables,
}: CheckCapabilityParams) => {
  const apiClient = await ApiClient.init();
  await apiClient.login(loginUserEmail);

  const capabilities = await getUserOrganizationCapabilityNames(
    loginUserEmail,
    organizationName
  );

  if (requiredCapability) {
    expect(
      capabilities.includes(requiredCapability),
      `user ${loginUserEmail} should have capability ${requiredCapability}`
    ).toBeTruthy();
  }

  if (capabilityBlackList) {
    for (const capability of capabilityBlackList) {
      expect(
        capabilities.includes(capability),
        `user ${loginUserEmail} should not have capability ${capability}`
      ).toBeFalsy();
    }
  }

  const response = await apiClient.callGraphQL(query, variables);

  const responseBody = (await response.body()).toString();
  expect(responseBody.includes('Not authorized')).toBe(!shouldBeAuthorized);
};

export const getUserOrganizationCapabilityNames = async (
  email: string,
  organizationName: string
): Promise<string[]> => {
  const capabilities = await db('UserOrganization_Capability')
    .select('UserOrganization_Capability.name')
    .leftJoin(
      'User_Organization',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .leftJoin(
      'Organization',
      'Organization.id',
      'User_Organization.organization_id'
    )
    .leftJoin('User', 'User.id', 'User_Organization.user_id')
    .where('User.email', '=', email)
    .andWhere('Organization.name', '=', organizationName);

  return Array.from(new Set(capabilities.map(({ name }) => name)));
};
