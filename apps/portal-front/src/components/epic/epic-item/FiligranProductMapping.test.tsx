import {
  LogoFiligranIcon,
  LogoXtmOneIcon,
  OpenAevIconIcon,
  OpenCtiIconIcon,
  OpenGrcIcon,
} from '@filigran/icon';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { describe, expect, it } from 'vitest';
import { FiligranProductMapping } from '@/components/epic/epic-item/FiligranProductMapping';

describe('FiligranProductMapping', () => {
  it('contains all Filigran products from enum', () => {
    expect(Object.keys(FiligranProductMapping).sort()).toEqual(
      Object.values(FiligranProductEnum).sort()
    );
  });

  it.each`
    product                        | expectedName | expectedLogoComponent
    ${FiligranProductEnum.OPENCTI} | ${'OpenCTI'} | ${OpenCtiIconIcon}
    ${FiligranProductEnum.OPENAEV} | ${'OpenAEV'} | ${OpenAevIconIcon}
    ${FiligranProductEnum.OPENGRC} | ${'OpenGRC'} | ${OpenGrcIcon}
    ${FiligranProductEnum.XTMHUB}  | ${'XTM Hub'} | ${LogoFiligranIcon}
    ${FiligranProductEnum.XTMONE}  | ${'XTM One'} | ${LogoXtmOneIcon}
  `(
    'maps $product with expected name and logo',
    ({
      product,
      expectedName,
      expectedLogoComponent,
    }: {
      product: FiligranProductEnum;
      expectedName: string;
      expectedLogoComponent: React.ElementType;
    }) => {
      const metadata = FiligranProductMapping[product];

      expect(metadata.name).toBe(expectedName);

      const logo = metadata.logo as React.ReactElement;

      expect(logo.type).toBe(expectedLogoComponent);
    }
  );
});
