import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import Markdown from 'react-markdown';
import { EpicItemFooter } from './EpicItemFooter';

interface EpicItemDetailedProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
}

export const EpicItemDetailed = ({
  epic,
  serviceInstanceId,
}: EpicItemDetailedProps) => {
  return (
    <>
      <div className="p-l bg-page-background markdown-content">
        <h2>{epic.title}</h2>
        <div className="max-h-96 overflow-y-auto">
          <Markdown>{epic.description}</Markdown>
        </div>
        <Separator />
        <EpicItemFooter
          epic={epic}
          serviceInstanceId={serviceInstanceId}
          shiftEpicType={true}
        />
      </div>
    </>
  );
};
