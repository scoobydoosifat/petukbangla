import { afterEach, describe, expect, it, vi } from 'vitest';
import { locationQueryVariants, searchLocations } from './locationSearch';

describe('location search', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each(['Dhanmondi, Dhaka', 'ধানমন্ডি, ঢাকা'])('sends a Bangladesh geocoding query for %s', async (query) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [{ place_id: 1, lat: '23.7465', lon: '90.3760', display_name: 'Dhanmondi, Dhaka', type: 'suburb' }],
    });

    const results = await searchLocations(query);
    const [url, options] = fetch.mock.calls[0];
    const params = new URL(url).searchParams;

    expect(params.get('q')).toBe(query);
    expect(params.get('countrycodes')).toBe('bd');
    expect(params.get('accept-language')).toBe('bn,en');
    expect(options.headers.Accept).toBe('application/json');
    expect(results[0]).toMatchObject({ lat: 23.7465, lng: 90.376, label: 'Dhanmondi, Dhaka' });
  });

  it('returns no request for an empty query and reports provider errors', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(searchLocations('   ')).resolves.toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockResolvedValue({ ok: false, json: async () => [] });
    await expect(searchLocations('ঢাকা')).rejects.toThrow('জায়গাটি খুঁজে পাওয়া যায়নি');
  });

  it('tries a known transliteration variant when the map index uses another spelling', async () => {
    expect(locationQueryVariants('Fazley Rabbi Park')).toContain('Fazle Rabbi Park');
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ place_id: 2, lat: '23.7736', lon: '90.4151', display_name: 'Shahid Dr Fazle Rabbi Park, Dhaka', type: 'park' }],
      });

    await expect(searchLocations('Fazley Rabbi Park')).resolves.toEqual([expect.objectContaining({ lat: 23.7736, lng: 90.4151 })]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
