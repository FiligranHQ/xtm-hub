import {db} from "./db-connection";
export const removeSubscription = async (serviceId: string) => {
    await db("Subscription").delete('*').where('service_id', '=', serviceId)
};
