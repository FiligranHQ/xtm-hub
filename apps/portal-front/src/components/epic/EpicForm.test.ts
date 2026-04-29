import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { describe, expect, it } from 'vitest';
import {
  DESCRIPTION_END_VALUE_BY_PRODUCT,
  getEndDescription,
} from './EpicForm';

describe('getEndDescription', () => {
  it.each`
    product                        | description
    ${FiligranProductEnum.OPENCTI} | ${'OpenCTI'}
    ${FiligranProductEnum.OPENAEV} | ${'OpenAEV'}
    ${FiligranProductEnum.OPENGRC} | ${'OpenGRC'}
    ${FiligranProductEnum.XTMONE}  | ${'XTMOne'}
    ${FiligranProductEnum.XTMHUB}  | ${'XTM Hub'}
  `(
    'should return the description for $description',
    ({ product }: { product: FiligranProductEnum }) => {
      expect(getEndDescription(product)).toBe(
        DESCRIPTION_END_VALUE_BY_PRODUCT[product]
      );
    }
  );

  it('should fallback to OPENCTI description when product is undefined', () => {
    expect(getEndDescription(undefined)).toBe(
      DESCRIPTION_END_VALUE_BY_PRODUCT[FiligranProductEnum.OPENCTI]
    );
  });
});
