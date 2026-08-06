import testRender from '@/utils/test/test-render';
import {
  PortalCapability,
  SeoServiceInstanceLanguage,
} from '@graphql/generated';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LibraryUpdateMetadatas } from './LibraryUpdateMetadatas';

const commitMutation = vi.fn();
let seoServiceInstanceMetadata: Array<{
  language: SeoServiceInstanceLanguage;
  meta_title: string;
  meta_description: string;
}> = [];
let lastQueryVariables: Record<string, unknown> | null = null;

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useLazyLoadQuery: (_query: unknown, variables: Record<string, unknown>) => {
    lastQueryVariables = variables;
    return { seoServiceInstanceMetadata };
  },
  useMutation: () => [commitMutation, false],
}));

vi.mock('@/components/service/components/ServiceContext', () => ({
  useServiceContext: () => ({
    serviceInstance: { id: 'service-instance-1' },
  }),
}));

const renderComponent = () =>
  testRender(<LibraryUpdateMetadatas />, {
    me: {
      capabilities: [{ name: PortalCapability.ModifyServiceMetadata }],
    },
  });

describe('LibraryUpdateMetadatas', () => {
  beforeEach(() => {
    seoServiceInstanceMetadata = [];
    lastQueryVariables = null;
    commitMutation.mockReset();
  });

  it('loads metadata with service instance id and maps values by locale with defaults', async () => {
    seoServiceInstanceMetadata = [
      {
        language: SeoServiceInstanceLanguage.En,
        meta_title: 'Title EN',
        meta_description: 'Description EN',
      },
      {
        language: SeoServiceInstanceLanguage.Fr,
        meta_title: 'Title FR',
        meta_description: 'Description FR',
      },
      {
        language: 'unknown' as SeoServiceInstanceLanguage,
        meta_title: 'Ignored title',
        meta_description: 'Ignored description',
      },
    ];

    const { user } = renderComponent();
    await user.click(screen.getByRole('button', { name: 'Utils.Edit' }));

    expect(lastQueryVariables).toEqual({
      service_instance_id: 'service-instance-1',
    });
    expect(screen.getByLabelText('Meta-title (EN)')).toHaveValue('Title EN');
    expect(screen.getByLabelText('Meta-description (EN)')).toHaveValue(
      'Description EN'
    );
    expect(screen.getByLabelText('Meta-title (FR)')).toHaveValue('Title FR');
    expect(screen.getByLabelText('Meta-description (FR)')).toHaveValue(
      'Description FR'
    );
    expect(screen.getByLabelText('Meta-title (JA)')).toHaveValue('');
    expect(screen.getByLabelText('Meta-description (JA)')).toHaveValue('');
  });

  it('submits one mutation per locale, includes edited values and closes dialog on success', async () => {
    commitMutation.mockImplementation(
      (opts: {
        variables: Record<string, unknown>;
        onCompleted: () => void;
      }) => {
        opts.onCompleted();
      }
    );

    const { user } = renderComponent();
    await user.click(screen.getByRole('button', { name: 'Utils.Edit' }));
    await user.type(screen.getByLabelText('Meta-title (EN)'), 'SEO EN');
    await user.type(screen.getByLabelText('Meta-description (FR)'), 'SEO FR');
    await user.click(screen.getByRole('button', { name: 'Utils.Validate' }));

    expect(commitMutation).toHaveBeenCalledTimes(3);
    const callsByLanguage = new Map(
      commitMutation.mock.calls.map(([call]) => [
        (call as { variables: { language: SeoServiceInstanceLanguage } })
          .variables.language,
        call,
      ])
    );
    expect(callsByLanguage.get(SeoServiceInstanceLanguage.En)).toEqual(
      expect.objectContaining({
        variables: {
          service_instance_id: 'service-instance-1',
          language: SeoServiceInstanceLanguage.En,
          input: { meta_title: 'SEO EN', meta_description: '' },
        },
      })
    );
    expect(callsByLanguage.get(SeoServiceInstanceLanguage.Fr)).toEqual(
      expect.objectContaining({
        variables: {
          service_instance_id: 'service-instance-1',
          language: SeoServiceInstanceLanguage.Fr,
          input: { meta_title: '', meta_description: 'SEO FR' },
        },
      })
    );
    expect(callsByLanguage.get(SeoServiceInstanceLanguage.Ja)).toEqual(
      expect.objectContaining({
        variables: {
          service_instance_id: 'service-instance-1',
          language: SeoServiceInstanceLanguage.Ja,
          input: { meta_title: '', meta_description: '' },
        },
      })
    );
    expect(
      screen.queryByRole('button', { name: 'Utils.Validate' })
    ).not.toBeInTheDocument();
  });

  it('keeps dialog open when mutation fails with an Error', async () => {
    commitMutation.mockImplementation(
      (opts: { onError: (error: Error) => void }) => {
        opts.onError(new Error('ACCESS_DENIED'));
      }
    );

    const { user } = renderComponent();
    await user.click(screen.getByRole('button', { name: 'Utils.Edit' }));
    await user.click(screen.getByRole('button', { name: 'Utils.Validate' }));

    expect(
      screen.getByRole('button', { name: 'Utils.Validate' })
    ).toBeInTheDocument();
  });

  it('keeps dialog open when mutation fails with a non-Error', async () => {
    commitMutation.mockImplementation(
      (opts: { onError: (error: unknown) => void }) => {
        opts.onError('string-error');
      }
    );

    const { user } = renderComponent();
    await user.click(screen.getByRole('button', { name: 'Utils.Edit' }));
    await user.click(screen.getByRole('button', { name: 'Utils.Validate' }));

    expect(
      screen.getByRole('button', { name: 'Utils.Validate' })
    ).toBeInTheDocument();
  });
});
