import { formatDate } from '@/utils/date';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { LogoFiligranIcon } from 'filigran-icon';
import { Avatar } from 'filigran-ui/clients';
import { ReactNode } from 'react';

const DocumentBento = ({
  document,
  children,
}: {
  document: documentItem_fragment$data;
  children: ReactNode;
}) => {
  return (
    <div className="flex h-full -mx-s gap-xs bg-page-background">
      <div className="flex flex-col flex-1 gap-xs text-xs">
        <div className="flex flex-1 justify-center rounded border gap-2 dark:text-white items-center">
          <div className="size-6">
            <Avatar src={document.uploader?.picture ?? ''} />
          </div>
          {`${document.uploader?.first_name} ${document.uploader?.last_name}`}
        </div>
        <div className="flex justify-center items-center flex-[2] rounded px-4 text-center border from-blue to-turquoise-300 bg-gradient-to-r dark:from-darkblue-900 dark:to-darkblue-600 dark:bg-gradient-to-r dark:txt-white">
          {document.name}
        </div>
        <div className="flex flex-1 gap-xs text-xs">
          <div className="flex items-center justify-center flex-[3] rounded border dark:text-white">
            {formatDate(
              document.updated_at ?? document.created_at,
              'DATE_FULL'
            )}
          </div>
          <div className="flex flex-1 items-center justify-center rounded border dark:text-white">
            <LogoFiligranIcon className="size-6" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 w-1/2 border rounded p-xs">{children}</div>
    </div>
  );
};

export default DocumentBento;
