import { USE_CASES_BY_PLATFORM_IDENTIFIER } from '@/components/service/trial-instances/form-constants';
import testRender from '@/utils/test/test-render';
import { trialInstancesDeploymentRequestsAvailableQuery } from '@generated/trialInstancesDeploymentRequestsAvailableQuery.graphql';
import {
  DeploymentRequestUseCase,
  PlatformIdentifier,
} from '@graphql/generated';
import { screen } from '@testing-library/react';
import React from 'react';
import { PreloadedQuery } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { TryFiligranProductForm } from './TryFiligranProductForm';

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  usePreloadedQuery: () => ({ deploymentRequestsAvailable: [] }),
}));

vi.mock('@/components/ui/AlertDialog', () => ({
  AlertDialogComponent: () => null,
}));

vi.mock('@/components/ui/TranslatableEnumSelectField', () => ({
  TranslatableEnumSelectField: ({
    values,
    translationNamespace,
  }: {
    values: string[];
    translationNamespace: string;
    field: unknown;
    label: string;
    placeholder: string;
  }) => (
    <div data-testid={`enum-select-${translationNamespace}`}>
      {values.map((v) => (
        <span key={v}>{v}</span>
      ))}
    </div>
  ),
}));

type FieldConfig = Record<
  string,
  {
    fieldType?: (props: {
      field: { value: string; onChange: () => void };
    }) => React.ReactNode;
  }
>;

vi.mock('@filigran/ui', () => ({
  AutoForm: ({
    fieldConfig,
    children,
  }: {
    fieldConfig: FieldConfig;
    children: React.ReactNode;
  }) => (
    <form>
      {Object.entries(fieldConfig).map(([key, config]) => (
        <div key={key}>
          {config.fieldType?.({ field: { value: '', onChange: vi.fn() } })}
        </div>
      ))}
      {children}
    </form>
  ),
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  FormMessage: () => null,
  Checkbox: () => null,
  Select: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: () => null,
  SelectItem: () => null,
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

const mockQueryRef =
  {} as PreloadedQuery<trialInstancesDeploymentRequestsAvailableQuery>;

const openaevUseCases =
  USE_CASES_BY_PLATFORM_IDENTIFIER[PlatformIdentifier.Openaev];
const openctiUseCases =
  USE_CASES_BY_PLATFORM_IDENTIFIER[PlatformIdentifier.Opencti];

describe('TryFiligranProductForm', () => {
  it.each`
    platformIdentifier            | expectedUseCases   | unexpectedUseCases | description
    ${PlatformIdentifier.Openaev} | ${openaevUseCases} | ${openctiUseCases} | ${'OpenAEV'}
    ${PlatformIdentifier.Opencti} | ${openctiUseCases} | ${openaevUseCases} | ${'OpenCTI'}
  `(
    'should show only $description use cases when platformIdentifier is $description',
    ({
      platformIdentifier,
      expectedUseCases,
      unexpectedUseCases,
    }: {
      platformIdentifier: PlatformIdentifier;
      expectedUseCases: DeploymentRequestUseCase[];
      unexpectedUseCases: DeploymentRequestUseCase[];
      description: string;
    }) => {
      testRender(
        <TryFiligranProductForm
          handleSubmit={vi.fn()}
          handleCloseSheet={vi.fn()}
          deploymentRequestsAvailabilityQueryRef={mockQueryRef}
          platformIdentifier={platformIdentifier}
        />,
        { relayConfig: createMockEnvironment() }
      );

      const useCaseContainer = screen.getByTestId(
        'enum-select-DeploymentRequestUseCase'
      );
      const renderedValues = Array.from(
        useCaseContainer.querySelectorAll('span')
      ).map((span) => span.textContent);

      expectedUseCases.forEach((useCase) => {
        expect(renderedValues).toContain(useCase);
      });
      unexpectedUseCases.forEach((useCase) => {
        expect(renderedValues).not.toContain(useCase);
      });
    }
  );
});
