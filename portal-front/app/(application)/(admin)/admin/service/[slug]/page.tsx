import { FunctionComponent } from 'react';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const Page: FunctionComponent<PageProps> = async ({ params }) => {
  const { slug } = await params;
  const id = decodeURIComponent(slug);
  return <PageLoader id={id} />;
};

export default Page;
