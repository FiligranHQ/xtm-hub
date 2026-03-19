import type { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { filterDocumentImages, findDocumentLogo } from './documents';

describe('Documents utils', () => {
  describe('filterDocumentImages', () => {
    it('should return only images with image_type IMAGE', () => {
      const document = {
        children_documents: [
          { id: '1', image_type: 'image' },
          { id: '2', image_type: 'logo' },
          { id: '3', image_type: 'image' },
        ],
      } as unknown as documentItem_fragment$data;
      const result = filterDocumentImages(document);
      expect(result).toEqual([
        { id: '1', image_type: 'image' },
        { id: '3', image_type: 'image' },
      ]);
    });

    it('should return an empty array if no children_documents', () => {
      const document = {} as documentItem_fragment$data;
      const result = filterDocumentImages(document);
      expect(result).toEqual([]);
    });

    it('should return an empty array if no images of type IMAGE', () => {
      const document = {
        children_documents: [
          { id: '1', image_type: 'logo' },
          { id: '2', image_type: 'logo' },
        ],
      } as unknown as documentItem_fragment$data;
      const result = filterDocumentImages(document);
      expect(result).toEqual([]);
    });

    it('should handle null children_documents', () => {
      const document = {
        children_documents: null,
      } as documentItem_fragment$data;
      const result = filterDocumentImages(document);
      expect(result).toEqual([]);
    });
  });

  describe('findDocumentLogo', () => {
    it('should return undefined if no child with image_type LOGO', () => {
      const document = {
        children_documents: [
          { id: '1', image_type: 'image' },
          { id: '2', image_type: 'image' },
        ],
      } as unknown as documentItem_fragment$data;
      const result = findDocumentLogo(document);
      expect(result).toBeUndefined();
    });

    it('should return undefined if children_documents is empty', () => {
      const document = {
        children_documents: [],
      } as unknown as documentItem_fragment$data;
      const result = findDocumentLogo(document);
      expect(result).toBeUndefined();
    });

    it('should return undefined if children_documents is null', () => {
      const document = {
        children_documents: null,
      } as unknown as documentItem_fragment$data;
      const result = findDocumentLogo(document);
      expect(result).toBeUndefined();
    });

    it('should return undefined if children_documents is missing', () => {
      const document = {} as documentItem_fragment$data;
      const result = findDocumentLogo(document);
      expect(result).toBeUndefined();
    });
  });
});
