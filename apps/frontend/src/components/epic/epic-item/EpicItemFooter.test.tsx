import { EpicItemFooter } from '@/components/epic/epic-item/EpicItemFooter';
import testRender from '@/utils/test/test-render';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EditionTypeEnum } from '@generated/models/EditionType.enum';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it } from 'vitest';

describe('EpicItemFooter', () => {
  const epic = {
    id: 'epic-1',
    title: 'Roadmap epic',
    epic_type: EpicTypeEnum.OTHER,
    edition_type: EditionTypeEnum.COMMUNITY_EDITION,
    product: FiligranProductEnum.OPENCTI,
    document_id: null,
  } as epic_fragment$data;

  const defaultProps = {
    epic,
    serviceInstanceId: 'service-instance-1',
  };

  it('renders product information', () => {
    // Given
    const environment = createMockEnvironment();

    // When
    testRender(<EpicItemFooter {...defaultProps} />, {
      relayConfig: environment,
    });

    // Then
    expect(screen.getByText('OpenCTI')).toBeInTheDocument();
  });

  it.each`
    editionType                           | expectedLabel
    ${EditionTypeEnum.COMMUNITY_EDITION}  | ${null}
    ${EditionTypeEnum.ENTERPRISE_EDITION} | ${'EE'}
    ${EditionTypeEnum.PARTIAL_EE}         | ${'Partial EE'}
  `(
    'renders edition tag according to edition type (editionType=$editionType)',
    ({ editionType, expectedLabel }) => {
      // Given
      const environment = createMockEnvironment();

      // When
      const { queryByText } = testRender(
        <EpicItemFooter
          {...defaultProps}
          epic={{ ...epic, edition_type: editionType }}
        />,
        {
          relayConfig: environment,
        }
      );

      // Then
      if (expectedLabel) {
        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
        return;
      }

      expect(queryByText('CE')).not.toBeInTheDocument();
      expect(queryByText('EE')).not.toBeInTheDocument();
      expect(queryByText('Partial EE')).not.toBeInTheDocument();
    }
  );

  it.each`
    epicType                    | documentId            | shouldRenderIntegration
    ${EpicTypeEnum.INTEGRATION} | ${'document-image-1'} | ${true}
    ${EpicTypeEnum.INTEGRATION} | ${null}               | ${false}
    ${EpicTypeEnum.OTHER}       | ${'document-image-1'} | ${false}
  `(
    'renders integration block according to type and document id (epicType=$epicType, documentId=$documentId)',
    ({ epicType, documentId, shouldRenderIntegration }) => {
      // Given
      const environment = createMockEnvironment();

      // When
      const { queryByText } = testRender(
        <EpicItemFooter
          {...defaultProps}
          epic={{ ...epic, epic_type: epicType, document_id: documentId }}
        />,
        {
          relayConfig: environment,
        }
      );

      const integrationBadge = queryByText('integration');

      // Then
      if (shouldRenderIntegration) {
        expect(integrationBadge).toBeInTheDocument();
        expect(
          screen.getByRole('img', { name: 'Roadmap epic logo' })
        ).toHaveAttribute(
          'src',
          expect.stringContaining(
            encodeURIComponent(
              '/document/images/service-instance-1/document-image-1'
            )
          )
        );
        return;
      }

      expect(integrationBadge).toBeNull();
    }
  );
});
