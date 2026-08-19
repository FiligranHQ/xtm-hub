import { ServiceFormSolutionCategoryField } from '@/components/service/form/SolutionCategoryField';
import { useSolutionCategories } from '@/components/service/form/UseSolutionCategories';
import testRender from '@/utils/test/test-render';
import { Form, FormField } from '@filigran/ui';
import { FiligranProduct } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/service/form/UseSolutionCategories', () => ({
  useSolutionCategories: vi.fn(),
}));

type FormValues = {
  solution_categories?: string[];
};

const TestForm = ({
  defaultValue,
  product,
}: {
  defaultValue?: string[];
  product?: FiligranProduct;
}) => {
  const form = useForm<FormValues>({
    defaultValues:
      defaultValue === undefined
        ? {}
        : {
            solution_categories: defaultValue,
          },
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="solution_categories"
        render={({ field }) => (
          <ServiceFormSolutionCategoryField
            field={field}
            product={product}
          />
        )}
      />
    </Form>
  );
};

describe('ServiceFormSolutionCategoryField', () => {
  it('should display placeholder when no value is selected', () => {
    vi.mocked(useSolutionCategories).mockReturnValue([
      { id: 'cat-1', name: 'Endpoint Security' },
    ]);

    testRender(<TestForm defaultValue={undefined} />);

    expect(
      screen.getByRole('button', {
        name: 'Service.Form.SolutionCategoriesLabel',
      })
    ).toHaveTextContent('Service.Form.SolutionCategoriesPlaceholder');
  });

  it('should display selected categories from field value', () => {
    vi.mocked(useSolutionCategories).mockReturnValue([
      { id: 'cat-1', name: 'Endpoint Security' },
      { id: 'cat-2', name: 'Threat Intelligence' },
    ]);

    testRender(<TestForm defaultValue={['cat-1', 'cat-2']} />);

    expect(
      screen.getByRole('button', {
        name: 'Service.Form.SolutionCategoriesLabel',
      })
    ).toHaveTextContent('Endpoint Security');
    expect(
      screen.getByRole('button', {
        name: 'Service.Form.SolutionCategoriesLabel',
      })
    ).toHaveTextContent('Threat Intelligence');
  });

  it('should pass product to useSolutionCategories', () => {
    vi.mocked(useSolutionCategories).mockReturnValue([
      { id: 'cat-1', name: 'Endpoint Security' },
      { id: 'cat-2', name: 'Threat Intelligence' },
    ]);

    testRender(<TestForm product={FiligranProduct.Opencti} />);

    expect(useSolutionCategories).toHaveBeenCalledWith(FiligranProduct.Opencti);
  });
});
