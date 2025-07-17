import { DatabaseType } from '../../knexfile';

export const formatRawObject = ({
  typename,
  columnName,
  as,
  properties = {},
}: {
  columnName: string;
  typename: DatabaseType;
  as: string;
  properties?: Record<string, string>;
}) => {
  const jsonProperties = Object.entries(properties)
    .map(([key, value]) => `'${key}', ${value}`)
    .join(',');

  return `COALESCE(
  to_jsonb("${columnName}") || jsonb_build_object(
    ${jsonProperties} ${jsonProperties.length > 0 ? ',' : ''}
    '__typename', '${typename}'
  ), '{}'::jsonb
) AS ${as}`
    .replace(/\s+/g, ' ')
    .trim();
};
export const formatRawAggObject = ({
  typename,
  columnName,
  as,
  properties = {},
}: {
  columnName: string;
  typename: DatabaseType;
  as: string;
  properties?: Record<string, string>;
}) => {
  const jsonProperties = Object.entries(properties)
    .map(([key, value]) => `'${key}', ${value}`)
    .join(',');

  return `COALESCE(
    json_agg(
      DISTINCT to_jsonb("${columnName}") || jsonb_build_object(
        ${jsonProperties} ${jsonProperties.length > 0 ? ',' : ''}
        '__typename', '${typename}'
      )
    ) FILTER (WHERE "${columnName}".id IS NOT NULL), '[]'
  )::json AS ${as}`
    .replace(/\s+/g, ' ')
    .trim();
};
