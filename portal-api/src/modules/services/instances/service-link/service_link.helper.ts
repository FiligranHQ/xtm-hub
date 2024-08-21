import { dbUnsecure } from '../../../../../knexfile';
import { ServiceLinkMutator } from '../../../../model/kanel/public/ServiceLink';
import { ServiceLink } from '../../../../__generated__/resolvers-types';

export const loadUnsecureServiceLinkBy = async (field: ServiceLinkMutator) => {
  return dbUnsecure<ServiceLink>('Service_Link').where(field);
};
