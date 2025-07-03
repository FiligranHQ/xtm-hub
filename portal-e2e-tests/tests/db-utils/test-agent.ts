import { ApiClient } from '../tests_files/api/client';
import { expect } from '../fixtures/baseFixtures';
import { getUserOrganizationCapabilityNames } from './capability.helper';
import { DocumentNode } from 'graphql/language';
import gql from 'graphql-tag';

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

  async fetchServiceInstances(): Promise<{ id: string; slug: string }[]> {
    const query = gql`
      query ServiceInstances {
        serviceInstances(first: 10, orderBy: name, orderMode: asc) {
          edges {
            node {
              id
              slug
            }
          }
        }
      }
    `;

    const response = await this.apiClient.callGraphQL(query);
    const responseBody = await response.json();
    return responseBody.data.serviceInstances.edges.map((edge) => edge.node);
  }

  async createCustomDashboard(dashboard: {
    name: string;
    slug: string;
    short_description: string;
    description: string;
    active: boolean;
    labels: string[];
    product_version: string;
    content: { path: string; name: string; type: string };
    image: { path: string; name: string; type: string };
  }) {
    const serviceInstances = await this.fetchServiceInstances();
    const customDashboardServiceInstance = serviceInstances.find(
      (instance) => instance.slug === 'open-cti-custom-dashboards'
    );
    if (!customDashboardServiceInstance) {
      throw new Error('custom dashboard service instance not found');
    }

    const mutation = gql`
      mutation CreateCustomDashboard(
        $input: CreateCustomDashboardInput!
        $document: [Upload!]!
        $serviceInstanceId: String!
      ) {
        createCustomDashboard(
          input: $input
          document: $document
          serviceInstanceId: $serviceInstanceId
        ) {
          id
        }
      }
    `;

    const { content, image, ...input } = dashboard;

    const variables = {
      input,
      document: [{}, {}],
      serviceInstanceId: customDashboardServiceInstance.id,
    };

    const response = await this.apiClient.callGraphQLWithFiles(
      mutation,
      variables,
      [content, image]
    );

    expect(response.ok()).toBeTruthy();
  }

  async assertUserHasCapabilities(
    organizationName: string,
    {
      requiredCapability,
      disallowedCapabilities,
    }: { requiredCapability?: string; disallowedCapabilities?: string[] }
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

    if (disallowedCapabilities) {
      for (const capability of disallowedCapabilities) {
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
    shouldBeAuthorized?: boolean;
  }) {
    const response = await this.apiClient.callGraphQL(query, variables);

    const responseBody = (await response.body()).toString();
    const isAuthorized = !responseBody.includes('Not authorized');
    expect(isAuthorized).toBe(shouldBeAuthorized ?? true);
  }
}
