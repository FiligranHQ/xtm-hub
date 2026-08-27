import { isAllowedImageUrl } from '@/components/admin/voting-round/votable-feature.utils';

describe('isAllowedImageUrl', () => {
  it.each`
    value                                         | expected | description
    ${'/images/feature.png'}                      | ${true}  | ${'a local asset served by Next itself'}
    ${'https://res.cloudinary.com/x/feature.png'} | ${true}  | ${'an allow-listed remote host'}
    ${'https://evil.example.com/pwn.png'}         | ${false} | ${'a host outside the allow-list'}
    ${'http://res.cloudinary.com/x.png'}          | ${false} | ${'the right host over plain http'}
    ${'javascript:alert(1)'}                      | ${false} | ${'a script pseudo-protocol'}
    ${'not a url'}                                | ${false} | ${'a value that is not a URL at all'}
  `('should return $expected for $description', ({ value, expected }) => {
    expect(isAllowedImageUrl(value)).toBe(expected);
  });
});
