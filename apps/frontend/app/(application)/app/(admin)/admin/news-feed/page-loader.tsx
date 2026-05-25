import NewsFeedList from '@/components/admin/news-feed/NewsFeedList';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.NewsFeed',
  },
];

const PageLoader = () => {
  const t = useTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.NewsFeed')}</h1>
      <Suspense fallback={null}>
        <NewsFeedList />
      </Suspense>
    </>
  );
};

export default PageLoader;
