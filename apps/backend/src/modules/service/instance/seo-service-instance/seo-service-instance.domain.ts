import { db } from '../../../../../knexfile';
import {
  EditSeoServiceInstanceInput,
  SeoServiceInstanceLanguage,
  SeoServiceInstanceMetadata,
} from '../../../../__generated__/resolvers-types';
import { SEOServiceInstanceMutator } from '../../../../model/kanel/public/SEOServiceInstance';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import { NotFoundErrorCode } from '../../../../utils/error/error.code';

export const SeoServiceInstanceDomain = {
  loadSeoServiceInstancesBy: async (
    field: SEOServiceInstanceMutator
  ): Promise<SeoServiceInstanceMetadata[]> => {
    return db<SeoServiceInstanceMetadata>('SEO_ServiceInstance').where(field);
  },

  upsertSeoServiceInstance: async (
    serviceInstanceId: ServiceInstanceId,
    language: SeoServiceInstanceLanguage,
    payload: EditSeoServiceInstanceInput
  ): Promise<SeoServiceInstanceMetadata> => {
    const [seoServiceInstance] = await db<SeoServiceInstanceMetadata>(
      'SEO_ServiceInstance'
    )
      .insert({
        service_instance_id: serviceInstanceId,
        language,
        ...payload,
      })
      .onConflict(['service_instance_id', 'language'])
      .merge(payload)
      .returning('*');

    if (!seoServiceInstance) {
      throw new Error(NotFoundErrorCode.SeoServiceInstanceNotFound);
    }

    return seoServiceInstance;
  },
};
