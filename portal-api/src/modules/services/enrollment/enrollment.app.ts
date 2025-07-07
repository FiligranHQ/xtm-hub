import { v4 as uuidv4 } from 'uuid';
import { ServiceDefinitionIdentifier } from '../../../__generated__/resolvers-types';
import { PortalContext } from '../../../model/portal-context';
import { insertSubscription } from '../../subcription/subscription.helper';
import { serviceContractDomain } from '../contract/domain';
import { serviceDefinitionHelper } from '../definition/helper';
import { serviceInstanceHelper } from '../instances/helper';

interface EnrollOCTIInstancePayload {
  organizationId: string;
  platformId: string;
  platformUrl: string;
  platformTitle: string;
}

export const enrollmentApp = {
  enrollOCTIInstance: async (
    context: PortalContext,
    payload: EnrollOCTIInstancePayload
  ): Promise<string> => {
    const token = uuidv4();
    const configuration = {
      enroller_id: context.user.id,
      platform_id: payload.platformId,
      platform_url: payload.platformUrl,
      platform_title: payload.platformTitle,
      token: token,
    };

    const serviceDefinition = await serviceDefinitionHelper.findByIdentifier(
      context,
      ServiceDefinitionIdentifier.OctiEnrollment
    );

    if (!serviceDefinition) {
      throw new Error('ServiceDefinition not found');
    }

    const isConfigurationValid =
      await serviceContractDomain.isServiceConfigurationValid(
        context,
        serviceDefinition.id,
        configuration
      );

    if (!isConfigurationValid) {
      throw new Error('Service configuration validation failed');
    }

    // insert service instance
    const serviceInstanceId =
      await serviceInstanceHelper.createOCTIServiceInstance(
        context,
        serviceDefinition.id
      );

    await insertSubscription(context, {
      organization_id: payload.organizationId,
      service_instance_id: serviceInstanceId,
      start_date: new Date(),
      end_date: null,
      status: 'ACCEPTED',
      joining: 'AUTO_JOIN',
      billing: 0,
      justification: null,
    });

    await serviceContractDomain.saveConfiguration(
      context,
      serviceInstanceId,
      configuration
    );

    return token;
  },
};
