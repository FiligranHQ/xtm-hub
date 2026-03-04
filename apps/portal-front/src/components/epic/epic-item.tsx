'use client';
import { EpicItemHeader } from '@/components/epic/epic-item/epic-item-header';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';

interface EpicListProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
}

export const EpicItem = ({ epic, serviceInstanceId }: EpicListProps) => {
  return (
    <li className="group overflow-hidden border-light flex flex-col relative rounded border hover:cursor-pointer bg-page-background h-[348px]">
      <div className="relative flex items-center justify-center w-full h-1/2 rounded bg-gradient-to-r from-darkblue to-blue-500">
        <EpicItemHeader
          epic={epic}
          serviceInstanceId={serviceInstanceId}
        />
        <span className="txt-title">{epic.epic}</span>
      </div>
      <div className="bg-page-background text-ellipsis overflow-hidden p-l group-hover:bg-hover w-full h-1/2">
        <h2 className="text-base md:text-lg font-semibold leading-tight min-w-0 p-m pr-xxl">
          {epic.title}
        </h2>
        <p className="p-m text-gray-300 text-sm">{epic.short_description}</p>
      </div>
    </li>
  );
};
