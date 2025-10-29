import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';

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
