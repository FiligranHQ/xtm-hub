'use client';
import { EpicFilterType } from '@/components/epic/EpicFilter';
import { FiligranProduct } from '@graphql/generated';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const PRODUCT_PARAM = 'product';

export const useEpicFilter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawParam = searchParams.get(PRODUCT_PARAM);
  const selectedProduct: EpicFilterType | undefined =
    rawParam === 'all'
      ? 'all'
      : rawParam &&
          Object.values(FiligranProduct).includes(rawParam as FiligranProduct)
        ? (rawParam as FiligranProduct)
        : undefined;

  const setSelectedProduct = useCallback(
    (filter: EpicFilterType) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(PRODUCT_PARAM, filter);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [searchParams, router, pathname]
  );

  return { selectedProduct, setSelectedProduct };
};
