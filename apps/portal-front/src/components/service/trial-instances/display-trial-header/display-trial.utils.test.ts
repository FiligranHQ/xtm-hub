import {
  addDaysUntil,
  getDotColor,
  getHeaderDotColor,
} from '@/components/service/trial-instances/display-trial-header/display-trial.utils';
import * as Date from '@/utils/date';
import { vi } from 'vitest';
import { RegisteredPlatformWithDaysLeft } from './DisplayTrialList';

jest.mock('@/utils/date', () => ({
  daysUntil: jest.fn(),
}));

describe('getDotColor', () => {
  it.each`
    daysLeft | expected
    ${7}     | ${'bg-red'}
    ${8}     | ${'bg-red'}
    ${9}     | ${'bg-yellow'}
    ${22}    | ${'bg-yellow'}
    ${23}    | ${'bg-green'}
    ${0}     | ${'bg-red'}
    ${-5}    | ${'bg-red'}
  `(
    'should return $expected for days left is $daysLeft',
    ({ daysLeft, expected }) => {
      expect(getDotColor(daysLeft)).toBe(expected);
    }
  );
});

describe('getHeaderDotColor', () => {
  it.each`
    minimumDaysLeft | maximumDaysLeft | expected
    ${3}            | ${8}            | ${'bg-red'}
    ${8}            | ${8}            | ${'bg-red'}
    ${8}            | ${9}            | ${'bg-red'}
    ${21}           | ${22}           | ${'bg-yellow'}
    ${22}           | ${22}           | ${'bg-yellow'}
    ${22}           | ${23}           | ${'bg-yellow'}
    ${25}           | ${28}           | ${'bg-green'}
  `(
    'should return $expected for minimum days left is $minimumDaysLeft and maximum days left is $maximumDaysLeft',
    ({ minimumDaysLeft, maximumDaysLeft, expected }) => {
      const firstFreeTrial: Partial<RegisteredPlatformWithDaysLeft> = {
        daysUntilEnd: minimumDaysLeft,
      };
      const secondFreeTrial: Partial<RegisteredPlatformWithDaysLeft> = {
        daysUntilEnd: maximumDaysLeft,
      };

      expect(getHeaderDotColor([firstFreeTrial, secondFreeTrial])).toBe(
        expected
      );
    }
  );
});

describe('addDaysUntil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds addDaysUntil to each trial', () => {
    vi.spyOn(Date, 'daysUntil')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(11)
      .mockReturnValueOnce(12);
    const freeTrials = [
      {
        id: '1',
        subscription: {
          end_date: '2026-02-20',
        },
      },
      {
        id: '2',
        subscription: {
          end_date: '2026-02-21',
        },
      },
      {
        id: '3',
        subscription: {
          end_date: '2026-02-22',
        },
      },
    ];

    const result = addDaysUntil(freeTrials);

    expect(result).toEqual([
      {
        id: '1',
        subscription: {
          end_date: '2026-02-20',
        },
        daysUntilEnd: 10,
      },
      {
        id: '2',
        subscription: {
          end_date: '2026-02-21',
        },
        daysUntilEnd: 11,
      },
      {
        id: '3',
        subscription: {
          end_date: '2026-02-22',
        },
        daysUntilEnd: 12,
      },
    ]);
  });

  it('returns an empty array when freeTrials is empty', () => {
    vi.spyOn(Date, 'daysUntil').mockReturnValue(10);
    const result = addDaysUntil([]);

    expect(result).toEqual([]);
  });
});
