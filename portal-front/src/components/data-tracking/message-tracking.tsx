import { useFragment } from 'react-relay';
import { FunctionComponent } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'filigran-ui/clients';
import { FormatDate } from '@/utils/date';
import { messageTrackingFragment } from '@/components/data-tracking/tracking.graphql';
import {
  trackingMessage_fragment$data,
  trackingMessage_fragment$key,
} from '../../../__generated__/trackingMessage_fragment.graphql';

interface MessageTrackingProps {
  data: trackingMessage_fragment$key;
}

export const MessageTracking: FunctionComponent<MessageTrackingProps> = ({
  data,
}) => {
  const messageTracking: trackingMessage_fragment$data =
    useFragment<trackingMessage_fragment$key>(messageTrackingFragment, data);
  [...messageTracking].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      <Accordion
        type="single"
        defaultValue={messageTracking[0]?.id}
        collapsible
        className="w-full">
        {messageTracking.map((message) => {
          const { id, tracking_info, type, created_at } = message;
          return (
            <AccordionItem
              key={id}
              value={id}
              className=" border-b">
              <AccordionTrigger>
                <h2 className="py-2">
                  <strong>{type}</strong> {FormatDate(created_at)}
                </h2>
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-96 overflow-auto bg-gray-900 p-4 text-gray-200">
                  {JSON.stringify(tracking_info, null, 2)}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
