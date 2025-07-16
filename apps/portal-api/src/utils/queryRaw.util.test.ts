import { describe, expect, it } from 'vitest';
import { formatRawAggObject } from './queryRaw.util';

describe('formatRawAggObject', () => {
  it('should format the query correctly with properties', () => {
    const result = formatRawAggObject({
      typename: 'Organization',
      columnName: 'org',
      as: 'organizations',
      properties: {
        selected: 'org.id = "User".selected_organization_id',
      },
    });

    expect(result).toBe(
      "COALESCE( json_agg( DISTINCT to_jsonb(\"org\") || jsonb_build_object( 'selected', org.id = \"User\".selected_organization_id , '__typename', 'Organization' ) ) FILTER (WHERE \"org\".id IS NOT NULL), '[]' )::json AS organizations"
    );
  });
});
