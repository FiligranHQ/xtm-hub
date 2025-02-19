import { FormatDate } from '@/utils/date';
import * as React from 'react';

import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { Avatar, Badge } from 'filigran-ui';

import { roundToNearest } from '@/lib/utils';

// Component interface
interface DashboardDetailsProps {
  documentData: documentItem_fragment$data;
  downloadNumber: number;
}

const DashboardDetails: React.FunctionComponent<DashboardDetailsProps> = ({
  documentData,
  downloadNumber,
}) => {
  return (
    <div className="border rounded border-gray-700 border-opacity-50 w-1/4 ml-xl p-xl space-y-xl">
      <h2>Details</h2>
      <div className="flex">
        <h3>Built by</h3>
        <div className="ml-xl rounded flex bg-gray-200 dark:bg-gray-800 p-l">
          <div className="h-12 w-12">
            <Avatar src={documentData.uploader?.picture ?? ''} />
          </div>
          <div className="ml-s flex items-center">
            {`${documentData.uploader?.first_name} 
                ${documentData.uploader?.last_name}`}
          </div>
        </div>
      </div>
      <div className="flex">
        <h3>Last updated at</h3>
        <div className="ml-xl flex">
          {FormatDate(
            documentData.updated_at ?? documentData.created_at,
            false
          )}
        </div>
      </div>
      <div className="flex">
        <h3>Tags</h3>
        <div className="ml-xl flex gap-l">
          <Badge>Tags</Badge>
          <Badge variant="warning">Tags</Badge>
        </div>
      </div>
      <div className="flex">
        <h3>Downloads</h3>
        <div className="ml-xl flex gap-l">
          {/*+{roundToNearest(downloadNumber)}*/}+
          {roundToNearest(downloadNumber)}
        </div>
      </div>
    </div>
  );
};

export default DashboardDetails;
