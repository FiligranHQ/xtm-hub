import {
  ServiceForm,
  ServiceFormValues,
} from '@/components/service/components/subscribable-services.types';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import React, { createContext, useContext } from 'react';

export interface ServiceContextProps {
  serviceInstance: serviceInstance_fragment$data;
  translationKey: string;
  currentUserSubscriptionId?: string;
  handleAddSheet: (
    values: ServiceFormValues,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => Promise<void>;
  handleUpdateSheet: (
    values: ServiceFormValues,
    resource: documentItem_fragment$data,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => Promise<void>;
  handleDeleteSheet: (
    document: documentItem_fragment$data,
    onCompleted: () => void
  ) => Promise<void>;
  ServiceForm: ServiceForm;
  type: ShareableResourceType;
  setIntegrationType: (integrationType: IntegrationTypeEnum) => void;
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

export const AppServiceContext = ({ children, ...context }: ServiceProps) => {
  return (
    <ServiceContext.Provider value={context}>
      {children}
    </ServiceContext.Provider>
  );
};
