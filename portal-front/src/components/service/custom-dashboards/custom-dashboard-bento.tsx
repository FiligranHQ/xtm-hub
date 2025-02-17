import { FormatDate } from '@/utils/date';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { LogoFiligranIcon } from 'filigran-icon';
import { Avatar } from 'filigran-ui';

const CustomDashboardBento = ({
  customDashboard,
}: {
  customDashboard: documentItem_fragment$data;
}) => {
  return (
    <div className="flex h-[15rem] p-2 gap-xs">
      <div className="flex flex-col flex-1 gap-xs text-xs">
        <div
          className="flex flex-1 items-center justify-center rounded border gap-2 text-white items-center"
          style={{
            background:
              'radial-gradient(80.02% 39.33% at 51.52% 88.18%, rgba(15, 188, 255, 0.1) 0%, rgba(15, 188, 255, 0) 100%), linear-gradient(320.64deg, #021525 10.12%, rgba(40, 52, 79, 0) 98.26%), #00020C',
          }}>
          <div className="size-6">
            <Avatar src={customDashboard.uploader?.picture ?? ''} />
          </div>
          {`${customDashboard.uploader?.first_name} ${customDashboard.uploader?.last_name}`}
        </div>
        <div
          style={{
            background:
              'radial-gradient(215.08% 198.07% at 128.53% 121.12%, #16EBF9 2%, #3378FF 32%, rgba(51, 59, 255, 0.544101) 63%, rgba(51, 96, 255, 0) 100%)',
          }}
          className="flex justify-center items-center flex-[2] rounded px-4 text-center border text-lg text-white">
          {customDashboard.name}
        </div>
        <div className="flex flex-1 gap-xs text-xs">
          <div
            className="flex items-center justify-center flex-[3] rounded border text-white"
            style={{
              background:
                'radial-gradient(80.02% 39.33% at 51.52% 88.18%, rgba(15, 188, 255, 0.1) 0%, rgba(15, 188, 255, 0) 100%), linear-gradient(320.64deg, #021525 10.12%, rgba(40, 52, 79, 0) 98.26%), #00020C',
            }}>
            {FormatDate(
              customDashboard.updated_at ?? customDashboard.created_at,
              false
            )}
          </div>
          <div
            className="flex flex-1 items-center justify-center rounded border text-white"
            style={{
              background:
                'radial-gradient(80.02% 39.33% at 51.52% 88.18%, rgba(15, 188, 255, 0.1) 0%, rgba(15, 188, 255, 0) 100%), linear-gradient(320.64deg, #021525 10.12%, rgba(40, 52, 79, 0) 98.26%), #00020C',
            }}>
            <LogoFiligranIcon className="size-6" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 border rounded p-2 bg-background">
        {customDashboard.children_documents?.[0] && (
          <div
            className="flex-1"
            style={{
              backgroundImage: `url(/document/visualize/${customDashboard.id}/${customDashboard.children_documents?.[0]?.id})`,
              backgroundSize: 'cover',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CustomDashboardBento;
