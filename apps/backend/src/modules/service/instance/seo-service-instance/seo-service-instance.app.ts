import {
  MutationEditSeoServiceInstanceArgs,
  QuerySeoServiceInstanceMetadataArgs,
  SeoServiceInstanceMetadata,
} from '../../../../__generated__/resolvers-types';
import { SEOServiceInstanceMutator } from '../../../../model/kanel/public/SEOServiceInstance';
import { SeoServiceInstanceDomain } from './seo-service-instance.domain';

export const SeoServiceInstanceApp = {
  loadSeoServiceInstancesBy: async ({
    service_instance_id,
    language,
  }: QuerySeoServiceInstanceMetadataArgs): Promise<
    SeoServiceInstanceMetadata[]
  > => {
    const field: SEOServiceInstanceMutator = {
      service_instance_id: service_instance_id,
    };
    if (language != null) {
      field.language = language;
    }
    return SeoServiceInstanceDomain.loadSeoServiceInstancesBy(field);
  },

  editSeoServiceInstanceBy: async (
    args: MutationEditSeoServiceInstanceArgs
  ): Promise<SeoServiceInstanceMetadata> => {
    return SeoServiceInstanceDomain.upsertSeoServiceInstance(
      args.service_instance_id,
      args.language,
      args.input
    );
  },
};
