import { TrialGuideChecklistItem } from '@/components/service/trial-guide/TrialGuide.content';
import { useTranslate } from '@/hooks/use-translate';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ChecklistItemProps {
  index: number;
  item: TrialGuideChecklistItem;
}

const renderStrong = (chunks: ReactNode) => <strong>{chunks}</strong>;

export const ChecklistItem = ({ index, item }: ChecklistItemProps) => {
  const t = useTranslate();
  const { titleKey, descriptionKey, exampleKey, readMoreUrl } = item;

  return (
    <div className="flex gap-3 py-3 border-b border-[var(--border-elevation-subtle-layer-2)] last:border-b-0">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <div className="shrink-0 size-6 flex items-center justify-center border rounded border-filigran-brand-primary heading-sm">
            {index}
          </div>
          <p className="heading-sm">{t(titleKey)}</p>
        </div>
        <p className="content-body-compact">
          {t.rich(descriptionKey, { strong: renderStrong })}{' '}
          {readMoreUrl && (
            <Link
              className="text-filigran-brand-primary hover:underline"
              href={readMoreUrl}
              target="_blank"
              rel="noopener noreferrer">
              {t('Service.TrialGuide.ReadMore')}
            </Link>
          )}
        </p>
        {exampleKey && (
          <div className="rounded p-2 bg-[var(--bg-elevation-default-layer-1)] border border-[var(--border-elevation-subtle-layer-1)]">
            <p className="content-body-compact">{t(exampleKey)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistItem;
