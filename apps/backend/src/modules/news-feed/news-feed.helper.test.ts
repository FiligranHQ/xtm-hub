import { describe, expect, it } from 'vitest';
import {
  IntegrationType,
  NewsFeedItemType,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import {
  doesPlatformSupportNewsFeed,
  NewsFeedHelper,
} from './news-feed.helper';

describe('news-feed.helper', () => {
  describe('doesPlatformSupportNewsFeed', () => {
    it.each`
      version             | expected
      ${'7.260527.0'}     | ${true}
      ${'7.260529.0'}     | ${true}
      ${'8.0.0'}          | ${true}
      ${'7.260801.0-lts'} | ${true}
      ${'7.260526.0'}     | ${false}
      ${'7.260512.0'}     | ${false}
      ${'6.8.0'}          | ${false}
      ${'1.0.0'}          | ${false}
    `(
      'returns $expected for OpenCTI version $version',
      ({ version, expected }) => {
        expect(
          doesPlatformSupportNewsFeed(PlatformIdentifier.Opencti, version)
        ).toBe(expected);
      }
    );

    it('returns false for a missing version', () => {
      expect(
        doesPlatformSupportNewsFeed(PlatformIdentifier.Opencti, null)
      ).toBe(false);
    });

    it('returns false for an invalid version', () => {
      expect(
        doesPlatformSupportNewsFeed(PlatformIdentifier.Opencti, 'not-a-version')
      ).toBe(false);
    });

    it('returns true when no minimum is configured for the identifier', () => {
      expect(
        doesPlatformSupportNewsFeed(PlatformIdentifier.Openaev, '1.0.0')
      ).toBe(true);
    });
  });

  describe('getNewsFeedConfiguration', () => {
    it.each`
      identifier                                             | expected | description
      ${ServiceDefinitionIdentifier.OpenctiCustomDashboards} | ${true}  | ${'configured service definition'}
      ${ServiceDefinitionIdentifier.OpenctiPlaybooks}        | ${true}  | ${'playbooks service definition'}
      ${ServiceDefinitionIdentifier.OpenctiIntegrations}     | ${true}  | ${'integrations service definition'}
      ${ServiceDefinitionIdentifier.OpenctiRegistration}     | ${false} | ${'registration identifier'}
      ${ServiceDefinitionIdentifier.OpenaevScenarios}        | ${false} | ${'openaev scenarios identifier'}
    `(
      'should return a configuration $expected for $description ($identifier)',
      ({
        identifier,
        expected,
      }: {
        identifier: ServiceDefinitionIdentifier;
        expected: boolean;
      }) => {
        const document = { id: 'doc-id' } as Document;
        const configuration = NewsFeedHelper.getNewsFeedConfiguration(
          identifier,
          document
        );
        expect(configuration !== undefined).toBe(expected);
      }
    );

    it('should return undefined for an integration document that is a connector', () => {
      const document = {
        id: 'doc-id',
        integration_type: IntegrationType.Connector,
      } as Document & { integration_type: IntegrationType };

      const configuration = NewsFeedHelper.getNewsFeedConfiguration(
        ServiceDefinitionIdentifier.OpenctiIntegrations,
        document
      );

      expect(configuration).toBeUndefined();
    });

    it('should return a configuration for an integration document that is not a connector', () => {
      const document = {
        id: 'doc-id',
        integration_type: IntegrationType.CsvFeed,
      } as Document & { integration_type: IntegrationType };

      const configuration = NewsFeedHelper.getNewsFeedConfiguration(
        ServiceDefinitionIdentifier.OpenctiIntegrations,
        document
      );

      expect(configuration).toEqual({
        newsFeedType: NewsFeedItemType.ResourceIntegration,
        platformIdentifier: PlatformIdentifier.Opencti,
      });
    });
  });

  describe('addUtmToUrlPath', () => {
    const NEWS_FEED_UTM =
      'utm_source=opencti&utm_medium=newsfeed&utm_campaign=hub_resources';

    it.each`
      type                                        | expectedContent
      ${NewsFeedItemType.ResourceCustomDashboard} | ${'custom_dashboard'}
      ${NewsFeedItemType.ResourceCustomView}      | ${'custom_view'}
      ${NewsFeedItemType.ResourceIntegration}     | ${'integration'}
      ${NewsFeedItemType.ResourcePlaybook}        | ${'playbook'}
      ${'UNKNOWN_TYPE'}                           | ${'other'}
    `(
      'should set utm_content=$expectedContent for type $type',
      ({
        type,
        expectedContent,
      }: {
        type: NewsFeedItemType;
        expectedContent: string;
      }) => {
        const result = NewsFeedHelper.addUtmToUrlPath({
          urlPath: 'redirect/opencti_custom_dashboards',
          type,
          platformIdentifier: PlatformIdentifier.Opencti,
        });

        expect(result).toBe(
          `redirect/opencti_custom_dashboards?${NEWS_FEED_UTM}&utm_content=${expectedContent}`
        );
      }
    );

    it.each`
      urlPath                                                       | expected                                                                                               | description
      ${'redirect/opencti_playbooks?document_id=RG9jdW1lbnQ6MQ=='}  | ${`redirect/opencti_playbooks?document_id=RG9jdW1lbnQ6MQ%3D%3D&${NEWS_FEED_UTM}&utm_content=playbook`} | ${'keeps existing query parameters'}
      ${'/redirect/opencti_playbooks?document_id=abc#details'}      | ${`/redirect/opencti_playbooks?document_id=abc&${NEWS_FEED_UTM}&utm_content=playbook#details`}         | ${'keeps the leading slash and the fragment'}
      ${'redirect/opencti_playbooks?utm_source=other&utm_medium=x'} | ${`redirect/opencti_playbooks?${NEWS_FEED_UTM}&utm_content=playbook`}                                  | ${'overwrites existing utm values without duplicating them'}
    `(
      'should tag the url path: $description',
      ({ urlPath, expected }: { urlPath: string; expected: string }) => {
        const result = NewsFeedHelper.addUtmToUrlPath({
          urlPath,
          type: NewsFeedItemType.ResourcePlaybook,
          platformIdentifier: PlatformIdentifier.Opencti,
        });

        expect(result).toBe(expected);
      }
    );

    it('should be idempotent', () => {
      const params = {
        type: NewsFeedItemType.ResourceIntegration,
        platformIdentifier: PlatformIdentifier.Opencti,
      };
      const once = NewsFeedHelper.addUtmToUrlPath({
        urlPath: 'redirect/opencti_integrations?document_id=abc',
        ...params,
      });

      const twice = NewsFeedHelper.addUtmToUrlPath({
        urlPath: once,
        ...params,
      });

      expect(twice).toBe(once);
    });

    it('should use the platform identifier as utm_source', () => {
      const result = NewsFeedHelper.addUtmToUrlPath({
        urlPath: 'redirect/openaev_scenarios',
        type: NewsFeedItemType.ResourceCustomDashboard,
        platformIdentifier: PlatformIdentifier.Openaev,
      });

      expect(new URLSearchParams(result.split('?')[1]).get('utm_source')).toBe(
        'openaev'
      );
    });
  });
});
