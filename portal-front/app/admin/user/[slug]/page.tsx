import * as React from 'react';
import loadSerializableQuery from '@/relay/loadSerializableQuery';
import Preloader from './preloader';
import { redirect } from 'next/navigation';
import preloaderUserSlugQueryNode, {
  preloaderUserSlugQuery,
} from '../../../../__generated__/preloaderUserSlugQuery.graphql';

// Configuration or Preloader Query

// Component interface
interface PageProps {
  params: { slug: string };
}

// Component
const Page: React.FunctionComponent<PageProps> = async ({ params }) => {
  const id = decodeURIComponent(params.slug);
  try {
    const preloadedQuery = await loadSerializableQuery<
      typeof preloaderUserSlugQueryNode,
      preloaderUserSlugQuery
    >(preloaderUserSlugQueryNode, { id });
    return <Preloader preloadedQuery={preloadedQuery} />;
  } catch (e) {
    // If error at user loading, redirect to the list
    redirect('/admin/user');
  }
};

// Component export
export default Page;
