'use client';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import Image from 'next/image';

interface EpicListProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
}

export const EpicItem = ({ epic, serviceInstanceId }: EpicListProps) => {
  return (
    <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background h-[348px]">
      <div className="flex items-center justify-center w-full h-1/2 rounded bg-gradient-to-r from-darkblue-900 to-darkblue-600">
        <span className="txt-title">{epic.epic}</span>
        {epic.document && (
          <Image
            src={`/document/images/${serviceInstanceId}/${epic.document?.id}`}
            alt={`${epic.document?.id} logo`}
            width={96}
            height={96}
            style={{ minHeight: '96px' }}
            loading="lazy"
            className="rounded object-contain"
          />
        )}
      </div>
      <div className="bg-page-background text-ellipsis overflow-hidden p-l hover:bg-hover w-full h-1/2">
        <h2>{epic.title}</h2>
        <p className="txt-sub-content text-muted-foreground">
          {epic.short_description}
        </p>
      </div>
    </li>
  );
};
