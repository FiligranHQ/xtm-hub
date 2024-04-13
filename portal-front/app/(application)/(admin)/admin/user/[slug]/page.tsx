import * as React from 'react';
import PageLoader from './page-loader';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Configuration or Preloader Query

// Component interface
interface PageProps {
  params: { slug: string };
}

// Component
const Page: React.FunctionComponent<PageProps> = async ({ params }) => {
  const id = decodeURIComponent(params.slug);
  try {
    return <PageLoader id={id} />;
  } catch (e) {
    // If error at user loading, redirect to the list
    redirect('/admin/user');
  }
};

// Component export
export default Page;
