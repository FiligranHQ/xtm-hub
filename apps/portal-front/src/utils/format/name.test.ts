import { formatName, formatPersonNames } from '@/utils/format/name';

describe('Utils name format', () => {
  describe('formatName', () => {
    it.each`
      name            | expectedName
      ${'rOGeR'}      | ${'Roger'}
      ${'JeAN-RoGer'} | ${'Jean-Roger'}
      ${'JeAn RoGer'} | ${'Jean Roger'}
    `(`should format $name to $expectedName`, ({ name, expectedName }) => {
      const result = formatName(name);
      expect(result).toBe(expectedName);
    });
  });

  describe('formatPersonNames', () => {
    it.each`
      person                                         | expectedName
      ${undefined}                                   | ${''}
      ${{}}                                          | ${''}
      ${{ first_name: 'anNa' }}                      | ${'Anna'}
      ${{ last_name: 'aTkInS' }}                     | ${'Atkins'}
      ${{ first_name: 'anNa', last_name: 'aTkInS' }} | ${'Anna Atkins'}
    `(`should format $person in $expectedName`, ({ person, expectedName }) => {
      const result = formatPersonNames(person);
      expect(result).toBe(expectedName);
    });
  });
});
