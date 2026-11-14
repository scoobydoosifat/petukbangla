const STORAGE_KEY = 'petuk-tried-foods';

export const districtAliases = {
  Chittagong: 'Chattogram', Jessore: 'Jashore', Nawabganj: 'Chapainawabganj',
  Brahamanbaria: 'Brahmanbaria', Netrakona: 'Netrokona', Barisal: 'Barishal',
};

export const canonicalDistrict = (name) => districtAliases[name] || name;
export const loadTriedFoods = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
export const saveTriedFoods = (ids) => localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
export const progressPercent = (selected, total) => total ? Math.round((selected / total) * 100) : 0;
