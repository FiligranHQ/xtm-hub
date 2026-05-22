import { ServiceListLocalStorageKey } from '@/hooks/use-service-list-local-storage';
import React, { createContext, useContext } from 'react';

export interface ServiceListLocalStorageKeyContextProps {
  localStorageKey: ServiceListLocalStorageKey;
}

const ServiceListLocalStorageKeyContext = createContext<
  ServiceListLocalStorageKeyContextProps | undefined
>(undefined);

export const useServiceListLocalStorageKeyContext = () => {
  const context = useContext(ServiceListLocalStorageKeyContext);
  if (!context) {
    throw new Error(
      'useServiceListLocalStorageKey must be used within a ServiceProvider'
    );
  }
  return context;
};

export interface ServiceProps extends ServiceListLocalStorageKeyContextProps {
  children: React.ReactNode;
}

export const AppServiceListLocalStorageKeyContext = ({
  children,
  ...context
}: ServiceProps) => {
  return (
    <ServiceListLocalStorageKeyContext.Provider value={context}>
      {children}
    </ServiceListLocalStorageKeyContext.Provider>
  );
};
