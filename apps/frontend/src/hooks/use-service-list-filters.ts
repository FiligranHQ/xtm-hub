import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';

export const useServiceListFilters = () => {
  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { selectedFilters, setSelectedFilters } =
    useServiceListLocalStorage(localStorageKey);

  const addFilter = (filterKey: ServiceListFilterKey) => {
    setSelectedFilters([...selectedFilters, filterKey]);
  };

  const removeFilter = (filterKey: ServiceListFilterKey) => {
    setSelectedFilters(selectedFilters.filter((key) => key !== filterKey));
  };

  return {
    addFilter,
    removeFilter,
    selectedFilters,
  };
};
