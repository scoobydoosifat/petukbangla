import { useMemo } from 'react';
import { canonicalDistrict } from '../utils/foodMap';
import { foodColor } from '../utils/foodColor';

function ringsFromGeometry(geometry) {
  return geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates.flat();
}

function createProjector(geojson, width, height, padding = 30) {
  let minLongitude = Infinity; let maxLongitude = -Infinity;
  let minLatitude = Infinity; let maxLatitude = -Infinity;
  geojson.features.forEach((feature) => ringsFromGeometry(feature.geometry).forEach((ring) => ring.forEach(([longitude, latitude]) => {
    minLongitude = Math.min(minLongitude, longitude); maxLongitude = Math.max(maxLongitude, longitude);
    minLatitude = Math.min(minLatitude, latitude); maxLatitude = Math.max(maxLatitude, latitude);
  })));
  const scale = Math.min((width - padding * 2) / (maxLongitude - minLongitude), (height - padding * 2) / (maxLatitude - minLatitude));
  const drawnWidth = (maxLongitude - minLongitude) * scale;
  const drawnHeight = (maxLatitude - minLatitude) * scale;
  const offsetX = (width - drawnWidth) / 2;
  const offsetY = (height - drawnHeight) / 2;
  return ([longitude, latitude]) => [offsetX + (longitude - minLongitude) * scale, offsetY + (maxLatitude - latitude) * scale];
}

function geometryPath(geometry, project) {
  return ringsFromGeometry(geometry).map((ring) => ring.map((point, index) => {
    const [x, y] = project(point);
    return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join('') + 'Z').join('');
}

export default function FoodMapGraphic({ geojson, foods, selectedIds, onDistrictClick, exportMode = false }) {
  const width = 590; const height = 740;
  const project = useMemo(() => createProjector(geojson, width, height), [geojson]);
  const firstByDistrict = useMemo(() => {
    const result = new Map();
    foods.forEach((food) => { if (!result.has(food.district)) result.set(food.district, food); });
    return result;
  }, [foods]);
  const bySlug = useMemo(() => new Map(foods.map((food) => [food.slug, food])), [foods]);
  const selectedByDistrict = useMemo(() => {
    const result = new Map();
    selectedIds.forEach((slug) => {
      const food = bySlug.get(slug);
      if (food) result.set(food.district, food);
    });
    return result;
  }, [selectedIds, bySlug]);

  return <svg className="food-map-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Interactive traditional food map of Bangladesh">
    <rect className="map-canvas" x="8" y="8" width={width - 16} height={height - 16} rx="24" fill="#fff6df" stroke="#d8aa31" strokeWidth="2" />
    <g>
      {geojson.features.map((feature, index) => {
        const district = canonicalDistrict(feature.properties.district);
        const food = selectedByDistrict.get(district) || firstByDistrict.get(district);
        const isSelected = selectedByDistrict.has(district);
        return <path key={`${district}-${index}`} d={geometryPath(feature.geometry, project)} fillRule="evenodd"
          className={`district-shape ${food ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
          fill={isSelected ? foodColor(food) : '#d7e1dc'}
          stroke={isSelected ? '#fff8e8' : '#315f50'}
          strokeWidth={isSelected ? 1.9 : 1.1}
          vectorEffect="non-scaling-stroke"
          onClick={() => food && !exportMode && onDistrictClick(food)}>
          <title>{food ? `${food.districtBn} — ${food.nameBn}` : district}</title>
        </path>;
      })}
    </g>
  </svg>;
}
