import { EpicItemFooter } from '@/components/epic/epic-item/EpicItemFooter';
import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import Markdown from 'react-markdown';

interface EpicItemDetailedProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
}

export const EpicItemDetailed = ({
  epic,
  serviceInstanceId,
}: EpicItemDetailedProps) => {
  return (
    <div className="p-l bg-page-background markdown-content flex h-full min-h-0 flex-1 flex-col">
      <h2>{epic.title}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Markdown>{epic.description}</Markdown>
      </div>
      <Separator />
      <EpicItemFooter
        epic={epic}
        serviceInstanceId={serviceInstanceId}
      />
    </div>
  );
};
