'use client';
import { EpicList } from '@/components/epic/epic-list';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { createContext, useContext } from 'react';
interface EpicListConnectionContextType {
  connectionID: string;
}

// Custom hook to use the ConnectionContext
export const getEpicListContext = (): EpicListConnectionContextType => {
  const context = useContext(EpicListContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
const EpicListContext = createContext<
  EpicListConnectionContextType | undefined
>(undefined);

interface EpicListProps {
  epics: epic_fragment$data[];
  serviceInstance: serviceInstance_fragment$data;
  connectionID: string;
}

export const EpicPage = ({
  epics,
  serviceInstance,
  connectionID,
}: EpicListProps) => {
  return (
    <EpicListContext.Provider value={{ connectionID }}>
      <EpicList
        epics={epics}
        serviceInstance={serviceInstance}
      />
    </EpicListContext.Provider>
  );
};
