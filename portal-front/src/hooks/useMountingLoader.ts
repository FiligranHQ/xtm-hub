import { Portal, portalContext } from '@/components/portal-context';
import { useContext, useEffect } from 'react';
import { VariablesOf } from 'relay-runtime';

const useMountingLoader = (
  loadQuery: (variables: VariablesOf<any>, options?: any) => void,
  variables: VariablesOf<any>
) => {
  // Only redo if variable values really change
  const { me } = useContext<Portal>(portalContext);
  const variablesValues = JSON.stringify(variables);
  useEffect(() => {
    loadQuery(JSON.parse(variablesValues), {
      fetchPolicy: 'store-and-network',
    });
  }, [loadQuery, variablesValues, me]);
};

export default useMountingLoader;
