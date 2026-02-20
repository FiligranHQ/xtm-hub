import { db } from './db-connection';
import { v4 as uuidv4 } from 'uuid';

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

export const loadServiceDefinitionIdByIdentifier = async (
  identifier: string
) => {
  return await db('ServiceDefinition')
    .select('ServiceDefinition.id')
    .where({ identifier });
};

export const addServiceInstance = async (serviceDefinitionId: string) => {
  const id = uuidv4();
  await db('ServiceInstance').insert([
    {
      id: id,
      name: 'OpenCTI Platform',
      description: '',
      creation_status: 'READY',
      public: false,
      join_type: 'JOIN_AUTO',
      tags: ['openCTI'],
      service_definition_id: serviceDefinitionId,
    },
  ]);

  return id;
};
