import { v4 as uuidv4 } from 'uuid';
import ServicePrice, {
  ServicePriceId,
} from '../../../../model/kanel/public/ServicePrice';
import { Resolvers } from '../../../../__generated__/resolvers-types';
import { ServiceId } from '../../../../model/kanel/public/Service';
import { db } from '../../../../../knexfile';
import { fromGlobalId } from 'graphql-relay/node/node.js';

const resolvers: Resolvers = {
  Mutation: {
    addServicePrice: async (_, { input }, context) => {
      const dataServicePrice = {
        id: uuidv4() as unknown as ServicePriceId,
        service_id: fromGlobalId(input.service_id).id as ServiceId,
        fee_type: input.fee_type,
        start_date: new Date(),
        price: input.price,
      };

      const [addedServicePrice] = await db<ServicePrice>(
        context,
        'Service_Price'
      )
        .insert(dataServicePrice)
        .returning('*');

      return addedServicePrice;
    },
  },
};

export default resolvers;
