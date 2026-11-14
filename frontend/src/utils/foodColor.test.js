import { describe, expect, it } from 'vitest';
import { foodColor } from './foodColor';

describe('foodColor', () => {
  it('assigns a food-matched palette color', () => {
    expect(foodColor({ nameBn: 'ইলিশ মাছ', slug: 'hilsa' })).toBe('#2f7f8d');
    expect(foodColor({ nameBn: 'রস মিষ্টি', slug: 'sweet' })).toBe('#d76a7b');
  });

  it('is deterministic for uncategorized food', () => {
    const food = { name: 'Unique local dish', slug: 'unique-dish' };
    expect(foodColor(food)).toBe(foodColor(food));
  });
});
