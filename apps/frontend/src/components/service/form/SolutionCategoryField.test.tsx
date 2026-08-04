import { ServiceFormSolutionCategoryField } from '@/components/service/form/SolutionCategoryField';
import { useSolutionCategories } from '@/components/service/form/UseSolutionCategories';
import testRender from '@/utils/test/test-render';
import { Form, FormField } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/service/form/UseSolutionCategories', () => ({
  useSolutionCategories: vi.fn(),
}));

type FormValues = {
  solution_category?: string;
};

const TestForm = ({
  defaultValue,
  document,
}: {
  defaultValue?: string;
  document?: documentItem_fragment$data;
}) => {
  const form = useForm<FormValues>({
    defaultValues:
      defaultValue === undefined
        ? {}
        : {
            solution_category: defaultValue,
          },
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="solution_category"
        render={({ field }) => (
          <ServiceFormSolutionCategoryField
            field={field}
            document={document}
          />
        )}
      />
    </Form>
  );
};

describe('ServiceFormSolutionCategoryField', () => {
  it('should display document category when missing from fetched options', () => {
    vi.mocked(useSolutionCategories).mockReturnValue([
      { id: 'cat-1', name: 'Endpoint Security' },
    ]);

    const document = {
      solution_category: {
        id: 'cat-legacy',
        name: 'Legacy Category',
      },
    } as unknown as documentItem_fragment$data;

    testRender(
      <TestForm
        document={document}
        defaultValue={undefined}
      />
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Legacy Category');
  });

  it('should display document category from fetched options when present', () => {
    vi.mocked(useSolutionCategories).mockReturnValue([
      { id: 'cat-1', name: 'Endpoint Security' },
      { id: 'cat-2', name: 'Threat Intelligence' },
    ]);

    const document = {
      solution_category: {
        id: 'cat-2',
        name: 'Threat Intelligence',
      },
    } as unknown as documentItem_fragment$data;

    testRender(<TestForm document={document} />);

    expect(screen.getByRole('combobox')).toHaveTextContent(
      'Threat Intelligence'
    );
  });

  it('should prioritize field value over document category', () => {
    vi.mocked(useSolutionCategories).mockReturnValue([
      { id: 'cat-1', name: 'Endpoint Security' },
      { id: 'cat-2', name: 'Threat Intelligence' },
    ]);

    const document = {
      solution_category: {
        id: 'cat-2',
        name: 'Threat Intelligence',
      },
    } as unknown as documentItem_fragment$data;

    testRender(
      <TestForm
        document={document}
        defaultValue="cat-1"
      />
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Endpoint Security');
  });
});
