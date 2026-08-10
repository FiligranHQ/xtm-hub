import { describe, expect, it } from 'vitest';
import { defineCompositeKey } from './dataloader-key.util';

interface TestFields extends Record<string, string> {
  organizationId: string;
  serviceInstanceId: string;
  userId: string;
}

const compositeKey = defineCompositeKey<TestFields>([
  'organizationId',
  'serviceInstanceId',
  'userId',
]);

describe('defineCompositeKey', () => {
  describe('create', () => {
    it('should join values following the declared field order', () => {
      const key = compositeKey.create({
        userId: 'user',
        organizationId: 'organization',
        serviceInstanceId: 'instance',
      });

      expect(key).toBe('organization:instance:user');
    });
  });

  describe('parse', () => {
    it('should rebuild the fields from a key created by the same codec', () => {
      const fields = {
        organizationId: 'organization',
        serviceInstanceId: 'instance',
        userId: 'user',
      };

      expect(compositeKey.parse(compositeKey.create(fields))).toEqual(fields);
    });

    it.each`
      key                         | description
      ${'organization:instance'}  | ${'too few segments'}
      ${'a:b:c:d'}                | ${'too many segments'}
      ${':instance:user'}         | ${'empty leading segment'}
      ${'organization::user'}     | ${'empty middle segment'}
      ${'organization:instance:'} | ${'empty trailing segment'}
      ${''}                       | ${'empty key'}
    `('should throw for "$key" ($description)', ({ key }) => {
      expect(() => compositeKey.parse(key)).toThrow(
        `Invalid composite key: ${key}`
      );
    });
  });
});
