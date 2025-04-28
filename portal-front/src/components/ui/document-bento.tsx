import { formatDate } from '@/utils/date';
import { csvFeedItem_fragment$data } from '@generated/csvFeedItem_fragment.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { LogoFiligranIcon } from 'filigran-icon';
import { Avatar } from 'filigran-ui/clients';

const DocumentBento = ({
  document,
  serviceInstanceId,
}: {
  document: documentItem_fragment$data | csvFeedItem_fragment$data;
  serviceInstanceId: string;
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
      <div className="flex flex-1 w-1/2 border rounded p-xs">
        {document.children_documents?.[0] && (
          <div
            className="flex-1"
            style={{
              backgroundImage: `url(/document/images/${serviceInstanceId}/${document.children_documents?.[0]?.id})`,
              backgroundSize: 'cover',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentBento;
