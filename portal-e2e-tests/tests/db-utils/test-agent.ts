import { ApiClient } from '../tests_files/api/client';
import { expect } from '../fixtures/baseFixtures';
import { getUserOrganizationCapabilityNames } from './capability.helper';
import { DocumentNode } from 'graphql/language';

export class TestAgent {
  private constructor(
    private userEmail: string,
    private apiClient: ApiClient
  ) {}

  static async init(email: string): Promise<TestAgent> {
    const apiClient = await ApiClient.init();
    await apiClient.login(email);

    return new TestAgent(email, apiClient);
  }

  async assertUserHasCapabilities(
    organizationName: string,
    {
      requiredCapability,
      capabilityBlackList,
    }: { requiredCapability?: string; capabilityBlackList?: string[] }
  ) {
    const capabilities = await getUserOrganizationCapabilityNames(
      this.userEmail,
      organizationName
    );

    if (requiredCapability) {
      expect(
        capabilities.includes(requiredCapability),
        `user ${this.userEmail} should have capability ${requiredCapability}`
      ).toBeTruthy();
    }

    if (capabilityBlackList) {
      for (const capability of capabilityBlackList) {
        expect(
          capabilities.includes(capability),
          `user ${this.userEmail} should not have capability ${capability}`
        ).toBeFalsy();
      }
    }
  }

  async assertIsAuthorized({
    query,
    variables,
    shouldBeAuthorized,
  }: {
    query: DocumentNode;
    variables: Record<string, unknown>;
    shouldBeAuthorized: boolean;
  }) {
    const response = await this.apiClient.callGraphQL(query, variables);

    const responseBody = (await response.body()).toString();
    expect(responseBody.includes('Not authorized')).toBe(!shouldBeAuthorized);
  }
}
