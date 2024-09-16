import { loadUserBy } from '../../../modules/users/users.domain';
import { sendMail } from '../../../server/mail-service';
import { dispatch } from '../../../pub';
import { TrackingData } from '../../../model/tracking-data';
import { AWXAction } from '../awx.model';
import { launchAWXWorkflow } from '../awx-configuration';
import { ServiceId } from '../../../model/kanel/public/Service';
import { loadUnsecureAllUserFromServiceForAWX } from '../../../modules/services/services.helper';
import {
  loadUnsecureServiceLinkByService,
  updateServiceLink,
} from '../../../modules/services/instances/service-link/service_link.helper';

type AWXManageFunctionMap = Partial<{
  [key in AWXAction]: (...args: unknown[]) => Promise<unknown> | unknown;
}>;

export const manageAwxCallback = async (
  tracking: TrackingData,
  outputs: object
) => {
  console.log('manageAwxCallback tracking', tracking);
  console.log('manageAwxCallback outputs', outputs);

  const workflowInput: AWXManageFunctionMap = {
    [AWXAction.CREATE_USER]: manageCreateUser,
    [AWXAction.CREATE_COMMUNITY]: manageCreateCommunity,
  };

  const selectedFunction = workflowInput[tracking.type];
  if (selectedFunction) {
    await selectedFunction(tracking, outputs);
  }
};

const manageCreateUser = async (
  tracking: TrackingData,
  outputs: {
    'reset-password': string;
  }
) => {
  if (outputs && outputs['reset-password']) {
    const user = await loadUserBy('User.id', tracking.contextual_id);
    await sendMail({
      to: user.email,
      subject: 'Welcome to the Portal',
      text: `You can now connect to the Portal with this password: ${outputs['reset-password']}`,
    });
  }
  await dispatch('ActionTracking', 'edit', tracking);
};

const manageCreateCommunity = async (tracking: TrackingData) => {
  const community_id: ServiceId = tracking.contextual_id as ServiceId;
  const usersFromService =
    await loadUnsecureAllUserFromServiceForAWX(community_id);
  const servicesLink = await loadUnsecureServiceLinkByService(community_id);
  await launchAWXWorkflow({
    type: AWXAction.COMMUNITY_ADD_USERS,
    input: {
      id: community_id,
      users: usersFromService,
    },
  });

  const serviceLinksMap = {
    OCTI: `https://opencti.${community_id}.cyber-intelligence-communities.eu`,
    Nextcloud: 'https://nextcloud.dev.scredplatform.io/',
  };

  for (const sLink of servicesLink) {
    const url = serviceLinksMap[sLink.name];
    if (url) {
      await updateServiceLink(sLink.id, {
        url,
      });
    }
  }
};
