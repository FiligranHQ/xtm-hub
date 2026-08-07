import { describe, expect, it } from 'vitest';
import { buildTupleFilter, uniqueTuples } from './batch-query.util';

describe('uniqueTuples', () => {
  it('should remove duplicated tuples while preserving the first occurrence order', () => {
    const result = uniqueTuples([
      ['a', 'b'],
      ['c', 'd'],
      ['a', 'b'],
      ['b', 'a'],
    ]);

    expect(result).toEqual([
      ['a', 'b'],
      ['c', 'd'],
      ['b', 'a'],
    ]);
  });

  it('should not merge tuples whose concatenation would collide', () => {
    const result = uniqueTuples([
      ['ab', 'c'],
      ['a', 'bc'],
    ]);

    expect(result).toHaveLength(2);
  });

  it('should return an empty array when no tuple is given', () => {
    expect(uniqueTuples([])).toEqual([]);
  });
});

describe('buildTupleFilter', () => {
  interface Key {
    organizationId: string;
    serviceInstanceId: string;
  }

  const columns = [
    {
      column: 'Subscription.organization_id',
      value: (key: Key) => key.organizationId,
    },
    {
      column: 'Subscription.service_instance_id',
      value: (key: Key) => key.serviceInstanceId,
    },
  ];

  it('should pair each declared column with the value extracted from the keys, in declaration order', () => {
    const result = buildTupleFilter<Key>(
      [{ organizationId: 'org', serviceInstanceId: 'instance' }],
      columns
    );

    expect(result.columns).toEqual([
      'Subscription.organization_id',
      'Subscription.service_instance_id',
    ]);
    expect(result.tuples).toEqual([['org', 'instance']]);
  });

  it('should deduplicate tuples built from the keys', () => {
    const result = buildTupleFilter<Key>(
      [
        { organizationId: 'org', serviceInstanceId: 'instance' },
        { organizationId: 'org', serviceInstanceId: 'instance' },
      ],
      columns
    );

    expect(result.tuples).toEqual([['org', 'instance']]);
  });

  it('should return an empty tuples array when no key is given', () => {
    const result = buildTupleFilter<Key>([], columns);

    expect(result.columns).toEqual([
      'Subscription.organization_id',
      'Subscription.service_instance_id',
    ]);
    expect(result.tuples).toEqual([]);
  });
});
