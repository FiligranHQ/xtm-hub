import { db } from './db-connection';

export const addServiceCapability = async (
  serviceCapabilityData: Record<string, unknown>
) => {
  await db('Service_Capability')
    .insert(serviceCapabilityData)
    .onConflict('id')
    .ignore();
};

export const deleteServiceCapability = async (serviceCapaId: string) => {
  await db('Service_Capability').where('id', '=', serviceCapaId).delete('*');
};

export const getServiceInstanceByName = async (name: string) => {
  return await db('ServiceInstance').where('name', '=', name).first();
};
