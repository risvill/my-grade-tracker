import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS } from '../utils/achievments'; // поправь путь

describe('achievements: Logic Validation', () => {
  
  it('should unlock "First Step" when 1 subject is added', () => {
    const ach = ACHIEVEMENTS.find(a => a.id === 'first_grade');
    const data = [{ total_percent: 50 }];
    expect(ach?.condition(data)).toBe(true);
  });

  it('should unlock "Perfectionist" when 3 subjects are 100%', () => {
    const ach = ACHIEVEMENTS.find(a => a.id === 'perfectionist');
    const data = [
      { total_percent: 100 }, 
      { total_percent: 100 }, 
      { total_percent: 100 },
      { total_percent: 50 }
    ];
    expect(ach?.condition(data)).toBe(true);
  });

  it('should NOT unlock "Perfectionist" if only 2 subjects are 100%', () => {
    const ach = ACHIEVEMENTS.find(a => a.id === 'perfectionist');
    const data = [{ total_percent: 100 }, { total_percent: 100 }];
    expect(ach?.condition(data)).toBe(false);
  });

  it('should correctly calculate average for "Survivor" (>60%)', () => {
    const ach = ACHIEVEMENTS.find(a => a.id === 'survivor');
    // Среднее: (70 + 80 + 40) / 3 = 63.3
    const data = [{ total_percent: 70 }, { total_percent: 80 }, { total_percent: 40 }];
    expect(ach?.condition(data)).toBe(true);
  });
});