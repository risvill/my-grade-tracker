import { describe, it, expect, vi } from 'vitest';
import { clampScore, handleScoreChange } from '../widgets/calculator/scoreValidation';

describe('scoreValidation: Score Validation Suite', () => {
  
  describe('clampScore', () => {
    it('should convert "50" to "50"', () => expect(clampScore("50")).toBe("50"));
    it('should clamp 150 to 100', () => expect(clampScore("150")).toBe("100"));
    it('should clamp -10 to 0', () => expect(clampScore("-10")).toBe("0"));
    it('should return an empty string for non-numeric input', () => {
      expect(clampScore("abc")).toBe("");
      expect(clampScore("")).toBe("");
    });
  });

  describe('handleScoreChange', () => {
    it('should correctly call setter and handleInputChange', () => {
      const mockSetter = vi.fn();
      const mockInputChange = vi.fn();

      handleScoreChange("85", mockSetter, "50", mockInputChange);

      expect(mockSetter).toHaveBeenCalledWith("85");
      expect(mockInputChange).toHaveBeenCalledWith(mockSetter, "85", "50");
    });

    it('should handle empty input correctly', () => {
      const mockSetter = vi.fn();
      const mockInputChange = vi.fn();

      handleScoreChange("", mockSetter, "50", mockInputChange);

      expect(mockSetter).toHaveBeenCalledWith("");
      expect(mockInputChange).toHaveBeenCalledWith(mockSetter, "", "50");
    });
  });
});