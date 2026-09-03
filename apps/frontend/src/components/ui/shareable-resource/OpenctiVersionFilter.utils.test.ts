import { describe, expect, it } from 'vitest';
import { groupInstanceNamesByVersion } from './OpenctiVersionFilter.utils';

describe('groupInstanceNamesByVersion', () => {
  it.each`
    description                                     | platforms                                                                                              | expected
    ${'no platforms'}                               | ${[]}                                                                                                  | ${[]}
    ${'a single instance for a version'}            | ${[{ version: '6.6.0', title: 'Production OpenCTI' }]}                                                 | ${[['6.6.0', ['Production OpenCTI']]]}
    ${'several instances sharing the same version'} | ${[{ version: '6.6.0', title: 'Production OpenCTI' }, { version: '6.6.0', title: 'Staging OpenCTI' }]} | ${[['6.6.0', ['Production OpenCTI', 'Staging OpenCTI']]]}
    ${'instances spread across different versions'} | ${[{ version: '6.6.0', title: 'Production OpenCTI' }, { version: '6.5.0', title: 'Staging OpenCTI' }]} | ${[['6.6.0', ['Production OpenCTI']], ['6.5.0', ['Staging OpenCTI']]]}
    ${'platforms without a version are ignored'}    | ${[{ version: null, title: 'Unversioned OpenCTI' }]}                                                   | ${[]}
  `('should group $description', ({ platforms, expected }) => {
    expect(groupInstanceNamesByVersion(platforms)).toEqual(new Map(expected));
  });
});
