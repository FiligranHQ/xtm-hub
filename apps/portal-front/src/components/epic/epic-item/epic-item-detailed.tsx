import { EpicItemHeader } from '@/components/epic/epic-item/epic-item-header';
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
    <>
      <div className="relative flex items-center justify-center w-full h-[25vh] rounded bg-gradient-to-r from-darkblue to-blue-500">
        <EpicItemHeader
          epic={epic}
          serviceInstanceId={serviceInstanceId}
          shiftEpicType={true}
        />
        <span className="txt-title">{epic.epic}</span>
      </div>
      <div className="p-l !bg-page-background markdown-content">
        <h2>{epic.title}</h2>
        <Markdown>{epic.description}</Markdown>
      </div>
    </>
  );
};
