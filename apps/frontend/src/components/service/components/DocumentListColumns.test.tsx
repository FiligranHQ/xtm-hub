import testRender from '@/utils/test/test-render';
import { DocumentMetadataKeyCode, IntegrationType } from '@graphql/generated';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { describe, expect, it } from 'vitest';
import {
  buildAuthorColumn,
  buildMetadataColumns,
  buildProductVersionColumn,
} from './DocumentListColumns';

type TestDocument = {
  integration_type?: string | null;
  product_version?: string | null;
  uploader: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
};

const t = (key: string) => key;
const buildCellContext = (
  document: TestDocument
): CellContext<TestDocument, unknown> =>
  ({ row: { original: document } }) as CellContext<TestDocument, unknown>;

describe('buildMetadataColumns', () => {
  const baseColumns = [{ id: 'name' }] as ColumnDef<TestDocument>[];

  it('adds author column for non-connector documents', () => {
    const columns = buildMetadataColumns({
      columns: baseColumns,
      documents: [
        {
          integration_type: IntegrationType.CsvFeed,
          uploader: null,
        },
      ],
      t,
    });

    expect(columns.map((column) => column.id)).toEqual([
      'name',
      'author_column',
    ]);
  });

  it('does not add author column for connector documents', () => {
    const columns = buildMetadataColumns({
      columns: baseColumns,
      documents: [
        {
          integration_type: IntegrationType.Connector,
          uploader: null,
        },
      ],
      t,
    });

    expect(columns.map((column) => column.id)).toEqual(['name']);
  });

  it('adds product version column when product version metadata exists', () => {
    const columns = buildMetadataColumns({
      columns: baseColumns,
      documents: [
        {
          integration_type: IntegrationType.CsvFeed,
          uploader: null,
          [DocumentMetadataKeyCode.ProductVersion]: true,
          product_version: '6.1.0',
        } as TestDocument & Record<DocumentMetadataKeyCode, boolean>,
      ],
      t,
    });

    expect(columns.map((column) => column.id)).toEqual([
      'name',
      'author_column',
      'minimum_deployable_version',
    ]);
  });
});

describe('buildProductVersionColumn', () => {
  it('renders the product version value when metadata exists', () => {
    const column = buildProductVersionColumn<TestDocument>(t);
    const document = {
      product_version: '5.0.1',
      uploader: null,
    } as TestDocument;

    const cell = column.cell;
    if (!cell) {
      throw new Error('column cell is not defined');
    }

    const { getByText } = testRender(<>{cell(buildCellContext(document))}</>);

    expect(getByText('5.0.1')).toBeInTheDocument();
  });

  it('renders empty value when product version metadata does not exist', () => {
    // Given
    const column = buildProductVersionColumn<TestDocument>(t);
    const document = {
      uploader: null,
    } as TestDocument;

    const cell = column.cell;
    if (!cell) {
      throw new Error('column cell is not defined');
    }

    // When
    const { container, queryByText } = testRender(
      <>{cell(buildCellContext(document))}</>
    );

    // Then
    expect(queryByText('5.0.1')).toBeNull();
    expect(container.textContent).toBe('');
  });
});

describe('buildAuthorColumn', () => {
  it('renders uploader identity via UserDisplay', () => {
    const column = buildAuthorColumn<TestDocument>(t);
    const document = {
      uploader: {
        first_name: 'alice',
        last_name: 'doe',
        email: 'alice.doe@example.com',
      },
    } as TestDocument;

    const cell = column.cell;
    if (!cell) {
      throw new Error('column cell is not defined');
    }

    const { getByText } = testRender(<>{cell(buildCellContext(document))}</>);

    expect(getByText('Alice Doe')).toBeInTheDocument();
  });
});
