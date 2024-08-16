import { dbUnsecure } from '../../../knexfile';
import ServiceCapability, {
  ServiceCapabilityMutator,
} from '../../model/kanel/public/ServiceCapability';

export const loadUnsecureServiceCapabitiesBy = (
  field: ServiceCapabilityMutator
) => {
  return dbUnsecure<ServiceCapability>('Service_Capability').where(field);
};
