'use client';
import { EpicFilterType } from '@/components/epic/epic-filter';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const PRODUCT_PARAM = 'product';

export const useEpicFilter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawParam = searchParams.get(PRODUCT_PARAM);
  const selectedProduct: EpicFilterType =
    rawParam &&
    Object.values(FiligranProductEnum).includes(rawParam as FiligranProductEnum)
      ? (rawParam as FiligranProductEnum)
      : 'all';

  const setSelectedProduct = useCallback(
    (filter: EpicFilterType) => {
      const params = new URLSearchParams(searchParams.toString());
      if (filter === 'all') {
        params.delete(PRODUCT_PARAM);
      } else {
        params.set(PRODUCT_PARAM, filter);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [searchParams, router, pathname]
  );

  return { selectedProduct, setSelectedProduct };
};
