const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function searchLocations(query, signal) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    q: trimmed,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'bd',
    'accept-language': 'bn,en',
  });
  const response = await fetch(`${NOMINATIM_URL}?${params}`, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('জায়গাটি খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।');
  const results = await response.json();
  return results
    .filter((result) => Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lon)))
    .map((result) => ({
      id: result.place_id,
      lat: Number(result.lat),
      lng: Number(result.lon),
      label: result.display_name,
      type: result.type,
    }));
}
