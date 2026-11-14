import { readFileSync, writeFileSync } from 'node:fs';

const [input, output, rawTolerance = '0.003'] = process.argv.slice(2);
const tolerance = Number(rawTolerance);
const squareTolerance = tolerance * tolerance;

function squareSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;
  if (dx || dy) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = end[0]; y = end[1]; }
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyStep(points, first, last, outputPoints) {
  let maxDistance = squareTolerance;
  let index = 0;
  for (let cursor = first + 1; cursor < last; cursor += 1) {
    const distance = squareSegmentDistance(points[cursor], points[first], points[last]);
    if (distance > maxDistance) { index = cursor; maxDistance = distance; }
  }
  if (!index) return;
  if (index - first > 1) simplifyStep(points, first, index, outputPoints);
  outputPoints.push(points[index]);
  if (last - index > 1) simplifyStep(points, index, last, outputPoints);
}

function simplifyRing(points) {
  if (points.length <= 5) return points;
  const simplified = [points[0]];
  simplifyStep(points, 0, points.length - 1, simplified);
  simplified.push(points.at(-1));
  const result = simplified.length >= 4 ? simplified : points;
  return result.map(([longitude, latitude]) => [Number(longitude.toFixed(4)), Number(latitude.toFixed(4))]);
}

function simplifyGeometry(geometry) {
  if (geometry.type === 'Polygon') geometry.coordinates = geometry.coordinates.map(simplifyRing);
  if (geometry.type === 'MultiPolygon') geometry.coordinates = geometry.coordinates.map((polygon) => polygon.map(simplifyRing));
}

const geojson = JSON.parse(readFileSync(input, 'utf8'));
geojson.features = geojson.features.filter((feature) => !feature.properties?.district?.includes('City Corporation'));
geojson.features.forEach((feature) => simplifyGeometry(feature.geometry));
writeFileSync(output, JSON.stringify(geojson));
