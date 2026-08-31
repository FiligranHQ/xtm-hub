import { TranslatableEnumSelectField } from '@/components/ui/TranslatableEnumSelectField';
import { Form } from '@filigran/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@filigran/ui', async () => {
  const actual =
    await vi.importActual<typeof import('@filigran/ui')>('@filigran/ui');

  return {
    ...actual,
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value: string;
      onValueChange: (nextValue: string) => void;
      children: ReactNode;
    }) => (
      <select
        aria-label="Category"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}>
        {children}
      </select>
    ),
    SelectContent: ({ children }: { children: ReactNode }) => children,
    SelectItem: ({
      value,
      children,
    }: {
      value: string;
      children: ReactNode;
    }) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children }: { children: ReactNode }) => children,
    SelectValue: () => null,
  };
});

interface FormValues {
  category: string;
}

const FakeForm = ({
  onChange = vi.fn(),
}: {
  onChange?: (value: string) => void;
}) => {
  const form = useForm<FormValues>({ defaultValues: { category: '' } });
  const field = form.register('category');

  return (
    <Form {...form}>
      <TranslatableEnumSelectField
        field={{
          ...field,
          value: form.watch('category'),
          onChange: (value: string) => {
            form.setValue('category', value);
            onChange(value);
          },
        }}
        label="Category"
        placeholder="Pick one"
        values={['first_value', 'second_value']}
        translationNamespace="MyNamespace"
      />
    </Form>
  );
};

describe('TranslatableEnumSelectField', () => {
  it('renders the label, asterisk and every translated value as an option', () => {
    render(<FakeForm />);

    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'MyNamespace.first_value' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'MyNamespace.second_value' })
    ).toBeInTheDocument();
  });

  const CustomClassNameHarness = () => {
    const form = useForm<FormValues>({ defaultValues: { category: '' } });
    const field = form.register('category');

    return (
      <Form {...form}>
        <TranslatableEnumSelectField
          field={{ ...field, value: '', onChange: vi.fn() }}
          label="Category"
          placeholder="Pick one"
          values={['first_value']}
          translationNamespace="MyNamespace"
          className="custom-class"
        />
      </Form>
    );
  };

  it('renders with a custom asterisk className', () => {
    render(<CustomClassNameHarness />);

    expect(screen.getByText('*')).toHaveClass('custom-class');
  });

  it('selects a value and forwards it to field.onChange', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FakeForm onChange={onChange} />);

    await user.selectOptions(screen.getByRole('combobox'), 'second_value');

    expect(onChange).toHaveBeenCalledWith('second_value');
  });
});
