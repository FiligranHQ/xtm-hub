import { graphql, HttpResponse } from 'msw';

type GraphqlError = {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

type GraphqlMockOptions<TData extends Record<string, unknown>> = {
  queryName: string;
  data?: TData;
  errors?: GraphqlError[];
  status?: number;
};

const buildGraphqlResponse = <TData extends Record<string, unknown>>(
  options: GraphqlMockOptions<TData>
) => {
  const { data, errors, status = 200 } = options;

  if (errors) {
    return HttpResponse.json({ errors }, { status });
  }

  return HttpResponse.json({ data: data ?? {} }, { status });
};

export const mockGraphqlQuery = <TData extends Record<string, unknown>>(
  options: GraphqlMockOptions<TData>
) => {
  const { queryName } = options;

  return graphql.query(queryName, () => {
    return buildGraphqlResponse(options) as never;
  });
};

export const mockGraphqlMutation = <TData extends Record<string, unknown>>(
  options: GraphqlMockOptions<TData>
) => {
  const { queryName } = options;

  return graphql.mutation(queryName, () => {
    return buildGraphqlResponse(options) as never;
  });
};
