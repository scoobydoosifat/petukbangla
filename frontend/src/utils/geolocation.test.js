import { describe, expect, it, vi } from 'vitest';
import { getAccuratePosition, HIGH_ACCURACY_OPTIONS } from './geolocation';

describe('accurate browser location', () => {
  it('requests a fresh high-accuracy reading and keeps the most accurate result', async () => {
    const geolocation = {
      watchPosition: vi.fn((success) => {
        setTimeout(() => success({ coords: { latitude: 23.8, longitude: 90.4, accuracy: 600 } }), 0);
        setTimeout(() => success({ coords: { latitude: 23.81, longitude: 90.41, accuracy: 35 } }), 1);
        return 9;
      }),
      clearWatch: vi.fn(),
    };

    const position = await getAccuratePosition(geolocation, { waitMs: 30 });

    expect(position.coords.accuracy).toBe(35);
    expect(geolocation.watchPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), HIGH_ACCURACY_OPTIONS);
    expect(geolocation.clearWatch).toHaveBeenCalledWith(9);
  });

  it('rejects a dangerously inaccurate location instead of creating a wrong pin', async () => {
    const geolocation = {
      watchPosition: vi.fn((success) => {
        setTimeout(() => success({ coords: { latitude: 23.7, longitude: 90.3, accuracy: 900 } }), 0);
        return 4;
      }),
      clearWatch: vi.fn(),
    };

    await expect(getAccuratePosition(geolocation, { waitMs: 5 })).rejects.toMatchObject({ code: 'LOW_ACCURACY', position: expect.any(Object) });
  });
});
