import { describe, it, expect } from 'vitest';
import { toggleSelection, deleteSelected, getFirstSelected } from '../widgets/calculator/faSelectionUtils';

describe('faSelectionUtils: Selection Logic Suite', () => {
  
  describe('toggleSelection', () => {
    it('should add an ID if it is not present', () => {
      expect(toggleSelection([1, 2], 3)).toEqual([1, 2, 3]);
    });

    it('should remove an ID if it is already present', () => {
      expect(toggleSelection([1, 2, 3], 2)).toEqual([1, 3]);
    });
  });

  describe('deleteSelected', () => {
    it('should remove items that are in the selection list', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const selected = [1, 3];
      expect(deleteSelected(items, selected)).toEqual([{ id: 2 }]);
    });
  });

  describe('getFirstSelected', () => {
    it('should return the correct item based on the first selected ID', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const selected = [2];
      expect(getFirstSelected(items, selected)).toEqual({ id: 2 });
    });

    it('should return undefined if selection is empty', () => {
      const items = [{ id: 1 }, { id: 2 }];
      expect(getFirstSelected(items, [])).toBeUndefined();
    });
  });
});