import * as React from 'react';
import { FunctionComponent, useCallback, useState } from 'react';
import { CommunityAcceptFormSheet } from '@/components/service/community/community-accept-form-sheet';
import { communityAcceptFormSchema } from '@/components/service/community/community-form-schema';
import { z } from 'zod';
import { useToast } from 'filigran-ui/clients';
import { useMutation } from 'react-relay';
import { servicePriceMutation } from '../../../../__generated__/servicePriceMutation.graphql';
import { ServicePriceCreateMutation } from '@/components/service/service-price.graphql';
import { serviceCommunityAcceptMutation } from '../../../../__generated__/serviceCommunityAcceptMutation.graphql';
import { ServiceCommunityAcceptMutation } from '@/components/service/service.graphql';
import { subscriptionEditMutation } from '../../../../__generated__/subscriptionEditMutation.graphql';
import { SubscriptionEditMutation } from '@/components/subcription/subscription.graphql';
import { subscriptionByService_fragment$data } from '../../../../__generated__/subscriptionByService_fragment.graphql';
import { Button } from 'filigran-ui/servers';
import { UnknownIcon } from 'filigran-icon';

interface AcceptCommunityProps {
  subscription: subscriptionByService_fragment$data;
  insertedUserServices: (userServices: any) => void;
  serviceId: string;
}

const AcceptCommunity: FunctionComponent<AcceptCommunityProps> = ({
  subscription,
  insertedUserServices,
  serviceId,
}) => {
  const [openSheetAcceptCommunity, setOpenSheetAcceptCommunity] =
    useState(false);
  const { toast } = useToast();
  const [commitSubscriptionMutation] = useMutation<subscriptionEditMutation>(
    SubscriptionEditMutation
  );

  const editSubscription = useCallback(
    (status: string) => {
      commitSubscriptionMutation({
        variables: {
          input: { status: status },
          id: subscription.id,
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: (
              <>
                {status === 'ACCEPTED'
                  ? 'Subscription accepted'
                  : 'Subscription refused'}
              </>
            ),
          });
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: <>{error.message}</>,
          });
        },
      });
    },
    [commitSubscriptionMutation, toast]
  );
  const editSubscriptions = (status: string) => {
    if (status === 'ACCEPTED') {
      setOpenSheetAcceptCommunity(true);
    } else {
      editSubscription(status);
    }
  };

  const [commitServicePriceMutation] = useMutation<servicePriceMutation>(
    ServicePriceCreateMutation
  );

  const [commitServiceCommunityAcceptMutation] =
    useMutation<serviceCommunityAcceptMutation>(ServiceCommunityAcceptMutation);

  const handleAcceptCommunity = (
    values: z.infer<typeof communityAcceptFormSchema>
  ) => {
    commitServiceCommunityAcceptMutation({
      variables: {
        input: {
          serviceId: serviceId,
          organizationsId: values.organizations_id,
        },
      },
      onCompleted: (response) => {
        insertedUserServices(response);
      },
      onError: (error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });

    commitServicePriceMutation({
      variables: {
        input: {
          service_id: serviceId,
          fee_type: values.fee_type,
          price: values.price,
        },
      },
      onCompleted: () => {},
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });

    setOpenSheetAcceptCommunity(false);
  };

  return (
    <>
      {subscription.status && (
        <div className="space-y-m">
          <div className="bg-white p-3">
            <h3>Why do I want this community:</h3>
            <div className="flex flex-row">
              <UnknownIcon className="mr-2 h-6 w-6" />
              {subscription.justification}
            </div>
          </div>
          <div className="space-x-m">
            <Button
              variant="destructive"
              onClick={() => editSubscriptions('REFUSED')}>
              Deny
            </Button>
            <Button
              variant="secondary"
              onClick={() => editSubscriptions('ACCEPTED')}>
              Accept
            </Button>
          </div>
        </div>
      )}
      {subscription.user_service?.[0]?.user?.organization && (
        <CommunityAcceptFormSheet
          title={'Accept a new community'}
          description={
            'Insert the billing here. Click Validate when you are done. The subscriptions will be accepted.'
          }
          handleSubmit={handleAcceptCommunity}
          open={openSheetAcceptCommunity}
          setOpen={setOpenSheetAcceptCommunity}
          mainOrganization={
            subscription.user_service?.[0]?.user?.organization ?? {
              id: '',
              name: '',
            }
          }
          validationSchema={communityAcceptFormSchema}
        />
      )}
    </>
  );
};

export default AcceptCommunity;
