import { redirect } from 'next/navigation';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

// Component
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
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
