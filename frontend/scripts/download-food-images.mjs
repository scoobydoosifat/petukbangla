import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const [catalogPath, outputDirectory] = process.argv.slice(2);
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const files = [...new Set(catalog.map((food) => basename(food.imageUrl)))];
mkdirSync(outputDirectory, { recursive: true });

for (const file of files) {
  const response = await fetch(`https://unseenbangladesh.com/assets/famous/${file}`);
  if (!response.ok) {
    console.warn(`Skipped ${file}: HTTP ${response.status}`);
    continue;
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  writeFileSync(join(outputDirectory, file), bytes);
  console.log(`Saved ${file}`);
}
