import { beforeEach, describe, expect, it } from 'vitest';
import { canonicalDistrict, loadTriedFoods, progressPercent, saveTriedFoods } from './foodMap';

describe('food map progress', () => {
  beforeEach(() => localStorage.clear());

  it('persists guest selections without an account', () => {
    saveTriedFoods(['dhaka', 'bogura']);
    expect(loadTriedFoods()).toEqual(['dhaka', 'bogura']);
  });

  it('recovers safely from invalid browser data', () => {
    localStorage.setItem('petuk-tried-foods', '{bad-json');
    expect(loadTriedFoods()).toEqual([]);
  });

  it('calculates completion and normalizes map aliases', () => {
    expect(progressPercent(31, 62)).toBe(50);
    expect(progressPercent(2, 0)).toBe(0);
    expect(canonicalDistrict('Chittagong')).toBe('Chattogram');
  });
});
