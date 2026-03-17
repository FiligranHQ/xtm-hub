import { FiligranProductMapping } from '@/components/epic/epic-item/filigran-product-mapping';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import Image from 'next/image';
import { FunctionComponent } from 'react';

interface EpicItemHeaderProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
  shiftEpicType?: boolean;
}
export const EpicItemHeader: FunctionComponent<EpicItemHeaderProps> = ({
  epic,
  serviceInstanceId,
  shiftEpicType = false,
}) => {
  return (
    <>
      <div className="absolute top-s w-full flex items-center justify-between">
        <div className="flex items-center ml-s gap-s">
          <p className="bold">{FiligranProductMapping[epic.product].logo}</p>

          <p className="bold">{FiligranProductMapping[epic.product].name}</p>
        </div>
        {epic.document && epic.epic_type === EpicTypeEnum.INTEGRATION && (
          <div
            className={`flex items-center mr-s gap-xs ${shiftEpicType ? 'pr-xxl' : ''}`}>
            <Image
              src={`/document/images/${serviceInstanceId}/${epic.document?.id}`}
              alt={`${epic.document?.id} logo`}
              width={32}
              height={32}
              loading="lazy"
              className="rounded object-contain"
            />
            <div className="bold h-8 flex items-center capitalize txt-sub-content rounded text-white bg-gray-1000/50 p-xs">
              {epic.epic_type.toLowerCase()}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
