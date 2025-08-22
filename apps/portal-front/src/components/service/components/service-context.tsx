import {
  ServiceForm,
  ServiceFormValues,
} from '@/components/service/components/subscribable-services.types';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import React, { createContext, FunctionComponent, useContext } from 'react';

export interface ServiceContextProps {
  serviceInstance: serviceInstance_fragment$data;
  translationKey: string;
  handleAddSheet: (
    values: ServiceFormValues,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => Promise<void>;
  handleUpdateSheet: (
    values: ServiceFormValues,
    resource: ShareableResource,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => Promise<void>;
  handleDeleteSheet: (
    document: ShareableResource,
    onCompleted: () => void
  ) => Promise<void>;
  ServiceForm: ServiceForm;
}

const ServiceContext = createContext<ServiceContextProps | undefined>(
  undefined
);

export const useServiceContext = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServiceContext must be used within a ServiceProvider');
  }
  return context;
};

export interface ServiceProps extends ServiceContextProps {
  children: React.ReactNode;
}

export const AppServiceContext: FunctionComponent<ServiceProps> = ({
  children,
  ...context
}) => {
  return (
    <ServiceContext.Provider value={context}>
      {children}
    </ServiceContext.Provider>
  );
};
