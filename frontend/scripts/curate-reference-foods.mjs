import { basename } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

const [referencePath, backendOutput, frontendOutput] = process.argv.slice(2);
const reference = JSON.parse(readFileSync(referencePath, 'utf8'));

const divisions = {
  Barishal: ['Barishal', 'Bhola', 'Barguna', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  Chattogram: ['Chattogram', "Cox's Bazar", 'Bandarban', 'Rangamati', 'Khagrachhari', 'Cumilla', 'Feni', 'Noakhali', 'Lakshmipur', 'Chandpur', 'Brahmanbaria'],
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Narsingdi', 'Munshiganj', 'Manikganj', 'Tangail', 'Kishorganj', 'Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur'],
  Khulna: ['Khulna', 'Bagerhat', 'Satkhira', 'Jashore', 'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Chuadanga'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
  Rajshahi: ['Rajshahi', 'Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Chapainawabganj', 'Pabna', 'Sirajganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon'],
  Sylhet: ['Sylhet', 'Sunamganj', 'Moulvibazar', 'Habiganj'],
};
const districtDivision = new Map(Object.entries(divisions).flatMap(([division, districts]) => districts.map((district) => [district, division])));
const nonFood = /cloth|textile|handloom|dress|sari|saree|pottery|muslin|jute|fibre|flower|stitch|kantha|rug|mat|agarwood|attar|gamchha|lungi/i;
const fallbacks = [
  [/hilsa/i, 'hilsa.jpg'], [/fish/i, 'haorfish.jpg'], [/sweet|mishti|rasgulla|ros|sandesh/i, 'sandesh.jpg'],
  [/rice/i, 'rice.jpg'], [/mango/i, 'mango.jpg'], [/tea/i, 'tea.jpg'], [/milk|yoghurt|doi/i, 'doi.jpg'],
  [/jaggery|gur/i, 'gur.jpg'], [/potato/i, 'potato.jpg'], [/shrimp|prawn/i, 'shrimp.jpg'],
];
const slugify = (value) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fallbackImage = (name) => fallbacks.find(([pattern]) => pattern.test(name))?.[1] || 'rice.jpg';

const foods = Object.entries(reference).flatMap(([district, data]) => (data.fam || [])
  .filter((entry) => entry[1] && entry[3] && !nonFood.test(entry[3]))
  .map(([emoji, nameBn, image, name]) => {
    const file = image?.f ? basename(image.f) : fallbackImage(name);
    const credit = image?.by
      ? `${image.by} · ${image.lic || 'license listed at source'} · ${image.src || 'Unseen Bangladesh'}`
      : 'Food association: Unseen Bangladesh; substitute thumbnail used where the source has no image.';
    return {
      slug: `${slugify(district)}-${slugify(name)}`,
      district: district === 'Kishorganj' ? 'Kishoreganj' : district,
      districtBn: data.bn,
      division: districtDivision.get(district),
      name, nameBn, emoji,
      imageUrl: `/images/foods/${file}`,
      imageCredit: credit,
      description: `${nameBn} — ${data.bn} জেলার পরিচিত স্বাদ।`,
      active: true,
    };
  }));

writeFileSync(backendOutput, `${JSON.stringify(foods, null, 2)}\n`);
writeFileSync(frontendOutput, `${JSON.stringify(foods.map((food, index) => ({ id: `seed-${index + 1}`, ...food })), null, 2)}\n`);
console.log(`Curated ${foods.length} edible records across ${new Set(foods.map((food) => food.district)).size} districts.`);
