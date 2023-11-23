import * as React from 'react';
import loadSerializableQuery from '@/relay/loadSerializableQuery';
import preloaderUserQueryNode, {
  preloaderUserQuery,
} from '../../../__generated__/preloaderUserQuery.graphql';
import Preloader from './preloader';

// Configuration or Preloader Query
const DEFAULT_COUNT = 10;

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = async () => {
  const preloadedQuery = await loadSerializableQuery<
    typeof preloaderUserQueryNode,
    preloaderUserQuery
  >(preloaderUserQueryNode, {
    count: DEFAULT_COUNT,
    orderBy: 'email',
    orderMode: 'asc',
  });
  return <Preloader preloadedQuery={preloadedQuery} />;
};

// Component export
export default Page;
