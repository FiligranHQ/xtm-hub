import { useSearchParams } from 'next/navigation';

const useDecodedQuery = () => {
  const searchParams = useSearchParams();
  const decodedQuery: Record<string, string | null> = {};

  searchParams.forEach((value, key) => {
    decodedQuery[key] = decodeURIComponent(value || '');
  });

  return decodedQuery;
};

export default useDecodedQuery;
