import {
  buildDocument,
  defineReplaceFileConfirmationTest,
  JSON_FILE_FIELD,
} from '@/components/service/form/ServiceForm.test-utils';
import { RssFeedForm } from '@/components/service/integrations/forms/RssFeedForm';
import { describe, vi } from 'vitest';

vi.mock('@graphql/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@graphql/generated')>()),
  useUseCasesListQuery: vi.fn(),
  useSolutionCategoriesListQuery: vi.fn(() => ({ data: undefined })),
}));

describe('RssFeedForm', () => {
  defineReplaceFileConfirmationTest({
    Form: RssFeedForm,
    fileField: JSON_FILE_FIELD,
    buildEditedDocument: buildDocument,
  });
});
