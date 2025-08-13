import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { dbUnsecure } from '../../../knexfile';
import { contextAdminUser, SERVICE_VAULT_ID } from '../../../tests/tests.const';
import { loadLinks } from './service-instance.domain';

describe('Service instance domain', () => {
  describe('loadLinks', () => {
    it('should return the service link when the service instance exists and has links', async () => {
      const links = await loadLinks(contextAdminUser, SERVICE_VAULT_ID);
      expect(links.length).toBe(1);
    });

    it('should return an empty array when the service instance exists but has no links', async () => {
      const generateId = uuidv4();
      const test = await dbUnsecure('ServiceInstance')
        .insert([
          {
            id: generateId,
            name: 'OpenCTI Platform',
            description: 'short description',
            creation_status: 'READY',
            public: false,
            join_type: 'JOIN_AUTO',
            tags: '{others}',
            service_definition_id: '5f769173-5ace-4ef3-b04f-2c95609c5b59',
          },
        ])
        .returning('id');
      expect(test).toBeTruthy();
      const links = await loadLinks(contextAdminUser, generateId);
      expect(links.length).toBe(0);
    });

    it('should return an empty array when the service instance does not exist', async () => {
      const generateId = uuidv4();
      const links = await loadLinks(contextAdminUser, generateId);
      expect(links.length).toBe(0);
    });
  });
});
