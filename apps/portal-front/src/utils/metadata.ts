import { loadBaseUrlFront } from '../../app/redirect/[identifier]/utils/load';

export const getMetadataBase = async (): Promise<URL> => {
  const appUrl = await loadBaseUrlFront();
  return new URL(appUrl);
};
