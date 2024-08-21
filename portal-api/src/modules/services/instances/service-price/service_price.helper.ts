import { db, dbUnsecure } from '../../../../../knexfile';
import ServicePrice, {
  ServicePriceMutator,
} from '../../../../model/kanel/public/ServicePrice';
import { PortalContext } from '../../../../model/portal-context';

export const loadUnsecureServicePriceBy = async (
  field: ServicePriceMutator
) => {
  return dbUnsecure<ServicePrice>('Service_Price').where(field);
};

export const insertServicePrice = async (
  context: PortalContext,
  dataServicePrice
) => {
  return db<ServicePrice>(context, 'Service_Price')
    .insert(dataServicePrice)
    .returning('*');
};
