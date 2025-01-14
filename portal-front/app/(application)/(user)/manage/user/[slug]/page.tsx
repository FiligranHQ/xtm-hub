import { redirect } from 'next/navigation';
import { FunctionComponent } from 'react';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

// Component
interface PageProps {
  params: Promise<{ slug: string }>;
}

const Page: FunctionComponent<PageProps> = async ({ params }) => {
  const { slug } = await params;
  const id = decodeURIComponent(slug);
  try {
    return <PageLoader id={id} />;
  } catch (_) {
    // If error at user loading, redirect to the list
    redirect('/admin/user');
  }
};

// Component export
export default Page;
