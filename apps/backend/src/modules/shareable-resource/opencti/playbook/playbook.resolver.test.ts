import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../../../tests/tests.const';
import { OpenCtiPlaybook } from '../../../../__generated__/resolvers-types';
import playbookResolver from './playbook.resolver';

describe('openCTIPlaybook field resolvers', () => {
  describe('openCTIPlaybook.children_documents', () => {
    it('should load children images by document id', async () => {
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

      const result = await playbookResolver.OpenCTIPlaybook!
        .children_documents!(
        { id: documentId } as unknown as OpenCtiPlaybook,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(
        contextSimpleUserFiligran2.dataLoaders.document.imagesByDocumentIdLoader
          .load
      ).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expected);
    });
  });
});
