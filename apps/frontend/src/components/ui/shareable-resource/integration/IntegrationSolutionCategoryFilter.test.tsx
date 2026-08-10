import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationSolutionCategoryFilter } from './IntegrationSolutionCategoryFilter';

const removeFilterMock = vi.fn();
const setSolutionCategoriesMock = vi.fn();
const removeSolutionCategoriesMock = vi.fn();

vi.mock('@/components/service/form/UseSolutionCategories', () => ({
  useSolutionCategories: () => [{ id: 'cat-1', name: 'Threat Intelligence' }],
}));

vi.mock(
  '@/components/service/components/ServiceListLocalStorageKeyContext',
  () => ({
    useServiceListLocalStorageKeyContext: () => ({ localStorageKey: 'feeds' }),
  })
);

vi.mock('@/hooks/use-service-list-local-storage', () => ({
  useServiceListLocalStorage: () => ({
    solutionCategories: {},
    setSolutionCategories: setSolutionCategoriesMock,
    removeSolutionCategories: removeSolutionCategoriesMock,
  }),
}));

vi.mock('@/hooks/use-service-list-filters', () => ({
  useServiceListFilters: () => ({
    removeFilter: removeFilterMock,
  }),
}));

describe('IntegrationSolutionCategoryFilter', () => {
  it('renders placeholder and options after opening the popover', async () => {
    const { user } = testRender(<IntegrationSolutionCategoryFilter />);

    const placeholder = screen.getByText(
      'Service.OpenctiIntegrations.Filter.SolutionCategory.Placeholder'
    );
    expect(placeholder).toBeInTheDocument();

    await user.click(placeholder);
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByText('Threat Intelligence')
    ).toBeInTheDocument();
  });

  it('calls setSolutionCategories when an option is selected', async () => {
    const { user } = testRender(<IntegrationSolutionCategoryFilter />);

    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.SolutionCategory.Placeholder'
      )
    );
    await user.click(
      within(screen.getByRole('listbox')).getByText('Threat Intelligence')
    );

    expect(setSolutionCategoriesMock).toHaveBeenCalledWith({ 'cat-1': [] });
  });

  it('calls remove callbacks when the remove button is clicked', async () => {
    const { user } = testRender(<IntegrationSolutionCategoryFilter />);

    await user.click(screen.getByRole('button', { name: 'Remove filter' }));

    expect(removeSolutionCategoriesMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.SolutionCategory
    );
  });
});
