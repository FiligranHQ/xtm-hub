import { graphql, useFragment } from 'react-relay';
import { messageTracking_fragment$key } from '../../../__generated__/messageTracking_fragment.graphql';
import { FunctionComponent } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'filigran-ui/clients';
import { FormatDate } from '@/utils/date';

export const messageTrackingFragment = graphql`
  fragment messageTracking_fragment on MessageTracking @relay(plural: true) {
    id
    created_at
    type
    technical
    tracking_info
  }
`;

interface MessageTrackingProps {
  data: messageTracking_fragment$key;
}

export const MessageTracking: FunctionComponent<MessageTrackingProps> = ({
  data,
}) => {
  const messageTracking = useFragment<messageTracking_fragment$key>(
    messageTrackingFragment,
    data
  );

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        className="w-full">
        {messageTracking.map((message) => {
          const { id, tracking_info, type, created_at } = message;
          return (
            <AccordionItem
              value={id}
              className=" border-b">
              <AccordionTrigger>
                <h2 className="py-2">
                  <strong>{type}</strong> {FormatDate(created_at)}
                </h2>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-gray-900 p-4 text-gray-200">
                  {tracking_info}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
