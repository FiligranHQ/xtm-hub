import testRender from '@/utils/test/test-render';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationType } from '@graphql/generated';
import { describe, expect, it } from 'vitest';
import {
  DocumentNameCell,
  DocumentShortDescriptionCell,
} from './DocumentListCells';

describe('DocumentNameCell', () => {
  it('renders connector status icons when document is a connector', () => {
    const document = {
      name: 'Connector document',
      active: true,
      integration_type: IntegrationType.Connector,
      manager_supported: true,
      verified: true,
    } as unknown as documentItem_fragment$data;

    const { container, getByText } = testRender(
      <DocumentNameCell document={document} />
    );

    expect(getByText('Connector document')).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });

  it('does not render status icons for non-connector documents', () => {
    const document = {
      name: 'CSV document',
      active: true,
      integration_type: IntegrationType.CsvFeed,
      manager_supported: true,
      verified: true,
    } as unknown as documentItem_fragment$data;

    const { container, getByText } = testRender(
      <DocumentNameCell document={document} />
    );

    expect(getByText('CSV document')).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });
});

describe('DocumentShortDescriptionCell', () => {
  it.each`
    shortDescription
    ${null}
    ${undefined}
    ${''}
  `(
    'renders nothing when short_description is "$shortDescription"',
    ({ shortDescription }) => {
      const document = {
        short_description: shortDescription,
      } as unknown as documentItem_fragment$data;

      const { container } = testRender(
        <DocumentShortDescriptionCell document={document} />
      );

      expect(container.firstChild).toBeNull();
    }
  );

  it('renders short description text', () => {
    const document = {
      short_description: 'A concise summary',
    } as unknown as documentItem_fragment$data;

    const { getByText } = testRender(
      <DocumentShortDescriptionCell document={document} />
    );

    expect(getByText('A concise summary')).toBeInTheDocument();
  });
});
