'use client';
import { EpicItem } from '@/components/epic/epic-item';
import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { useTranslations } from 'next-intl';

interface EpicListProps {
  epics: epic_fragment$data[];
}

export const EpicList = ({ epics }: EpicListProps) => {
  const t = useTranslations();

  return (
    <>
      <h1>{t('Epics.XTMRoadmap')}</h1>

      <div className="relative flex items-center justify-center">
        <Separator className="my-l absolute" />
        <span className="relative bg-background p-s text-muted-foreground">
          {'Now'}
        </span>
      </div>

      {epics.map((epic) => (
        <EpicItem
          key={epic.id}
          epic={epic}
        />
      ))}
    </>
  );
};
