import { redirect } from 'next/navigation';
import { FunctionComponent } from 'react';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string; url: string }>;
}

const Page: FunctionComponent<PageProps> = async ({ params }) => {
  const { slug, url } = await params;
  const id = decodeURIComponent(slug);
  try {
    return (
      <PageLoader
        id={id}
        url={url}
      />
    );
  } catch (_) {
    // If error at user loading, redirect to the list
    redirect('/');
  }
};

export default Page;
