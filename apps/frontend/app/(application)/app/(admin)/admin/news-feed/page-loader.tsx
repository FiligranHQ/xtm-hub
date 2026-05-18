import NewsFeedList from '@/components/admin/news-feed/NewsFeedList';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.NewsFeeds',
  },
];

const PageLoader = () => {
  const t = useTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.NewsFeeds')}</h1>
      <Suspense fallback={null}>
        <NewsFeedList />
      </Suspense>
    </>
  );
};

export default PageLoader;
