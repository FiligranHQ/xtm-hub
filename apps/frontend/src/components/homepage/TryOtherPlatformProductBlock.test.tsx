import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TryOtherPlatformProductBlock from './TryOtherPlatformProductBlock';

describe('TryOtherPlatformProductBlock', () => {
  it.each`
    product                           | expectedDescription1Key   | expectedDescription2Key   | expectedCtaKey   | expectedHref
    ${PlatformIdentifierEnum.OPENAEV} | ${'OpenAEV.Description1'} | ${'OpenAEV.Description2'} | ${'OpenAEV.Cta'} | ${'/app/service/openaev-free-trial'}
    ${PlatformIdentifierEnum.OPENCTI} | ${'OpenCTI.Description1'} | ${'OpenCTI.Description2'} | ${'OpenCTI.Cta'} | ${'/app/service/opencti-free-trial'}
  `(
    'renders cross-sell block for $product with correct trial CTA',
    ({
      product,
      expectedDescription1Key,
      expectedDescription2Key,
      expectedCtaKey,
      expectedHref,
    }) => {
      testRender(<TryOtherPlatformProductBlock product={product} />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(
        screen.getByText((_content, element) => {
          if (element?.tagName.toLowerCase() !== 'p') {
            return false;
          }
          const text = element.textContent ?? '';
          return (
            text.includes(expectedDescription1Key) &&
            text.includes(expectedDescription2Key)
          );
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: expectedCtaKey })
      ).toHaveAttribute('href', expectedHref);
    }
  );
});
