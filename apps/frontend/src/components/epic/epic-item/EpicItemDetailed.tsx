import { EpicItemFooter } from '@/components/epic/epic-item/EpicItemFooter';
import { FiligranProductMapping } from '@/components/epic/epic-item/FiligranProductMapping';
import MarkdownRendererWithTheme from '@/components/ui/MarkdownRendererWithTheme';
import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface EpicItemDetailedProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
}

export const EpicItemDetailed = ({
  epic,
  serviceInstanceId,
}: EpicItemDetailedProps) => {
  const t = useTranslations();

  return (
    <div className="p-l bg-page-background markdown-content flex h-full min-h-0 flex-1 flex-col">
      <h2>{epic.title}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MarkdownRendererWithTheme source={epic.description} />
      </div>
      <Separator />
      <div className="flex flex-row">
        <EpicItemFooter
          epic={epic}
          serviceInstanceId={serviceInstanceId}
        />
        <p className="flex flex-wrap items-center gap-1">
          <Link
            href={FiligranProductMapping[epic.product].link}
            target="_blank"
            rel="noopener noreferrer">
            <span className="whitespace-nowrap">{t('Epic.JoinCommunity')}</span>
          </Link>
        </p>
      </div>
    </div>
  );
};
