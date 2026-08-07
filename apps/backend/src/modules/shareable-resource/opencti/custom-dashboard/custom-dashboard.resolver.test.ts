import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../../../tests/tests.const';
import { CustomDashboard } from '../../../../__generated__/resolvers-types';
import customDashboardResolver from './custom-dashboard.resolver';

describe('customDashboard field resolvers', () => {
  describe('customDashboard.children_documents', () => {
    it('should load children images by document id', async () => {
      // Given
      const documentId = uuidv4();
      const expected = [{ id: uuidv4() }];
      vi.spyOn(
        contextSimpleUserFiligran2.dataLoaders.document
          .imagesByDocumentIdLoader,
        'load'
      ).mockResolvedValue(
        expected as unknown as Awaited<
          ReturnType<
            typeof contextSimpleUserFiligran2.dataLoaders.document.imagesByDocumentIdLoader.load
          >
        >
      );

      // When
      const result = await customDashboardResolver.CustomDashboard!
        .children_documents!(
        { id: documentId } as unknown as CustomDashboard,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(
        contextSimpleUserFiligran2.dataLoaders.document.imagesByDocumentIdLoader
          .load
      ).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });
});
