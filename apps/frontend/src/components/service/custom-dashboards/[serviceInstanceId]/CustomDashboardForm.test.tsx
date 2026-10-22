import { CustomDashboardForm } from '@/components/service/custom-dashboards/[serviceInstanceId]/CustomDashboardForm';
import {
  buildDocument,
  defineServiceFormTests,
  fillCommonCreationFields,
  JSON_FILE_FIELD,
  NEW_DESCRIPTION,
  typeNewDescription,
} from '@/components/service/form/ServiceForm.test-utils';
import { describe, vi } from 'vitest';

vi.mock('@graphql/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@graphql/generated')>()),
  useUseCasesListQuery: vi.fn(),
}));

describe('CustomDashboardForm', () => {
  defineServiceFormTests({
    Form: CustomDashboardForm,
    resourceName: 'dashboard',
    fileField: JSON_FILE_FIELD,
    shortDescriptionMaxLength: 255,
    buildEditedDocument: buildDocument,
    fillCreationFields: async (user) => {
      await fillCommonCreationFields(user);
      await typeNewDescription(user);
    },
    creationValues: { description: NEW_DESCRIPTION },
  });
});
