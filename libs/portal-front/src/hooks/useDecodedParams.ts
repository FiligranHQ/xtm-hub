import { useParams } from 'next/navigation';

const useDecodedParams = () => {
  const params = useParams<Record<string, string>>();
  const decodedParams: Record<string, string | null> = {};

  Object.keys(params).forEach((key) => {
    const encodedValue = params[key];
    decodedParams[key] = encodedValue ? decodeURIComponent(encodedValue) : null;
  });

  return decodedParams;
};

export default useDecodedParams;
