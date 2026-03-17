import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { createContext, useContext } from 'react';
export interface EpicListConnectionContextType {
  connectionID: string;
  filterByProduct: (product: FiligranProductEnum) => void;
}
export const useEpicListContext = (): EpicListConnectionContextType => {
  const context = useContext(EpicListContext);
  if (!context) {
    throw new Error(
      'useEpicListContext must be used within a EpicListContext.Provider'
    );
  }
  return context;
};
export const EpicListContext = createContext<
  EpicListConnectionContextType | undefined
>(undefined);
