import { db } from './db-connection';

export const addServiceCapability = async (serviceCapabilityData) => {
  await db('Service_Capability')
    .insert(serviceCapabilityData)
    .onConflict('id')
    .ignore();
};

export const deleteServiceCapability = async (serviceCapaId) => {
  await db('Service_Capability').where('id', '=', serviceCapaId).delete('*');
};
