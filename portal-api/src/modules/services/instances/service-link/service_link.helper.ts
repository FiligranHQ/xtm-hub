import { dbUnsecure } from '../../../../../knexfile';
import { ServiceLinkMutator } from '../../../../model/kanel/public/ServiceLink';
import { ServiceLink } from '../../../../__generated__/resolvers-types';
import { ServiceId } from '../../../../model/kanel/public/Service';

export const loadUnsecureServiceLinkBy = async (field: ServiceLinkMutator) => {
  return dbUnsecure<ServiceLink>('Service_Link').where(field);
};

export const loadUnsecureServiceLinkByService = async (
  service_id: ServiceId
) => {
  return dbUnsecure<ServiceLink>('Service_Link').where({
    service_id,
  });
};

export const updateServiceLink = async (
  id: ServiceId,
  serviceLink: ServiceLinkMutator
) => {
  return dbUnsecure<ServiceLink>('Service_Link')
    .where({ id })
    .update(serviceLink);
};
