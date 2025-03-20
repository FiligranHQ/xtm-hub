import { FormatDate } from '@/utils/date';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { LogoFiligranIcon } from 'filigran-icon';
import { Avatar } from 'filigran-ui/clients';

const CustomDashboardBento = ({
  customDashboard,
  serviceInstance,
}: {
  customDashboard: documentItem_fragment$data;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}) => {
  return (
    <div className=" py-2 h-full flex">
      <div className="bg-page-background flex flex-1 gap-xs">
        <div className="flex flex-col flex-1 gap-xs text-xs">
          <div className="flex flex-1 justify-center rounded border gap-2 dark:text-white items-center">
            <div className="size-6">
              <Avatar src={customDashboard.uploader?.picture ?? ''} />
            </div>
            {`${customDashboard.uploader?.first_name} ${customDashboard.uploader?.last_name}`}
          </div>
          <div className="flex justify-center items-center flex-[2] rounded px-4 text-center border from-blue to-turquoise-300 bg-gradient-to-r dark:from-darkblue-900 dark:to-darkblue-600 dark:bg-gradient-to-r dark:txt-white">
            {customDashboard.name}
          </div>
          <div className="flex flex-1 gap-xs text-xs">
            <div className="flex items-center justify-center flex-[3] rounded border dark:text-white">
              {FormatDate(
                customDashboard.updated_at ?? customDashboard.created_at,
                'DATE_FULL'
              )}
            </div>
            <div className="flex flex-1 items-center justify-center rounded border dark:text-white">
              <LogoFiligranIcon className="size-6" />
            </div>
          </div>
        </div>
        <div className="flex flex-1 border rounded p-2 bg-background">
          {customDashboard.children_documents?.[0] && (
            <div
              className="flex-1"
              style={{
                backgroundImage: `url(/document/images/${serviceInstance.id}/${customDashboard.children_documents?.[0]?.id})`,
                backgroundSize: 'cover',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDashboardBento;
