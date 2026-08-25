import { formatEmailList } from '@/components/service/bundle/manage-trial/manage-trial.utils';
import { describe, expect, it } from 'vitest';

describe('formatEmailList', () => {
  it.each([
    { emails: [], maxVisible: 3, expected: { visible: '', hiddenCount: 0 } },
    {
      emails: ['a@filigran.io'],
      maxVisible: 3,
      expected: { visible: 'a@filigran.io', hiddenCount: 0 },
    },
    {
      emails: ['a@filigran.io', 'b@filigran.io', 'c@filigran.io'],
      maxVisible: 3,
      expected: {
        visible: 'a@filigran.io, b@filigran.io, c@filigran.io',
        hiddenCount: 0,
      },
    },
    {
      emails: [
        'a@filigran.io',
        'b@filigran.io',
        'c@filigran.io',
        'd@filigran.io',
        'e@filigran.io',
      ],
      maxVisible: 3,
      expected: {
        visible: 'a@filigran.io, b@filigran.io, c@filigran.io',
        hiddenCount: 2,
      },
    },
    {
      emails: ['a@filigran.io', 'b@filigran.io'],
      maxVisible: 1,
      expected: { visible: 'a@filigran.io', hiddenCount: 1 },
    },
  ])(
    'returns $expected for $emails.length emails with maxVisible=$maxVisible',
    ({ emails, maxVisible, expected }) => {
      expect(formatEmailList(emails, maxVisible)).toEqual(expected);
    }
  );

  it('defaults maxVisible to 3 when not provided', () => {
    const emails = [
      'a@filigran.io',
      'b@filigran.io',
      'c@filigran.io',
      'd@filigran.io',
    ];

    expect(formatEmailList(emails)).toEqual({
      visible: 'a@filigran.io, b@filigran.io, c@filigran.io',
      hiddenCount: 1,
    });
  });
});
