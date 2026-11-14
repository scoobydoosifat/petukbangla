const foodPalettes = [
  ['fish', 'ইলিশ', 'মাছ', '#2f7f8d'],
  ['sweet', 'মিষ্টি', 'রস', '#d76a7b'],
  ['rice', 'ভাত', 'বিরিয়ানি', '#d49b32'],
  ['meat', 'মাংস', 'ভুনা', '#a94b35'],
  ['fruit', 'আম', 'কাঁঠাল', '#db8d2b'],
  ['tea', 'চা', 'পাতা', '#5f8b45'],
  ['milk', 'দুধ', 'দই', '#7796bd'],
  ['pitha', 'পিঠা', 'পুলি', '#a66a45'],
  ['bhorta', 'ভর্তা', 'শুঁটকি', '#728d43'],
];

const fallback = ['#c45a38', '#357f73', '#bc7a2d', '#8266a4', '#4f7da6', '#b15269', '#63834b', '#9b6845'];

export function foodColor(food = {}) {
  const text = `${food.name || ''} ${food.nameBn || ''} ${food.emoji || ''}`.toLowerCase();
  const match = foodPalettes.find((palette) => palette.slice(0, -1).some((term) => text.includes(term)));
  if (match) return match.at(-1);
  const key = food.slug || food.district || text || 'food';
  const hash = [...key].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 7);
  return fallback[hash % fallback.length];
}
