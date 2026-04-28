import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import Image from 'next/image';
import { FunctionComponent } from 'react';
import { FiligranProductMapping } from './FiligranProductMapping';

interface EpicItemFooterProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
  shiftEpicType?: boolean;
}
export const EpicItemFooter: FunctionComponent<EpicItemFooterProps> = ({
  epic,
  serviceInstanceId,
  shiftEpicType = false,
}) => {
  return (
    <>
      <div className="flex w-full justify-between">
        <div className="flex items-center gap-xs">
          <p className="bold">{FiligranProductMapping[epic.product].logo}</p>

          <p className="bold">{FiligranProductMapping[epic.product].name}</p>
        </div>
        {epic.document_id && epic.epic_type === EpicTypeEnum.INTEGRATION && (
          <div
            className={`flex items-center mr-s gap-xs ${shiftEpicType ? 'pr-xxl' : ''}`}>
            <Image
              src={`/document/images/${serviceInstanceId}/${epic.document_id}`}
              alt={`${epic.title} logo`}
              width={32}
              height={32}
              loading="lazy"
              className="h-8 w-auto rounded object-contain"
            />
            <div className="bold h-8 flex items-center capitalize txt-sub-content rounded bg-gray-800 text-white p-s">
              {epic.epic_type.toLowerCase()}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
