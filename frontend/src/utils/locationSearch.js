const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export function locationQueryVariants(query) {
  const trimmed = query.trim();
  const variants = [trimmed];
  const replacements = [
    [/\bfazley\b/gi, 'Fazle'],
    [/ফজলে রাব্বি/gi, 'Fazle Rabbi'],
    [/\bchittagong\b/gi, 'chattogram'],
  ];
  replacements.forEach(([pattern, replacement]) => {
    const variant = trimmed.replace(pattern, replacement);
    if (variant !== trimmed && !variants.includes(variant)) variants.push(variant);
  });
  return variants;
}

export async function searchLocations(query, signal) {
  const variants = locationQueryVariants(query);
  if (!variants[0]) return [];

  for (const variant of variants) {
    const params = new URLSearchParams({
      q: variant,
      format: 'jsonv2',
      addressdetails: '1',
      limit: '5',
      countrycodes: 'bd',
      'accept-language': 'bn,en',
    });
    const response = await fetch(`${NOMINATIM_URL}?${params}`, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('জায়গাটি খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।');
    const results = (await response.json())
      .filter((result) => Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lon)))
      .map((result) => ({
        id: result.place_id,
        lat: Number(result.lat),
        lng: Number(result.lon),
        label: result.display_name,
        type: result.type,
      }));
    if (results.length) return results;
  }
  return [];
}
