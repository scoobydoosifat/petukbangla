import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FoodMapGraphic from './FoodMapGraphic';
import { foodColor } from '../utils/foodColor';

const geojson = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature', properties: { district: 'Dhaka' },
    geometry: { type: 'Polygon', coordinates: [[[90.3, 23.7], [90.5, 23.7], [90.5, 23.9], [90.3, 23.9], [90.3, 23.7]]] },
  }],
};
const food = { id: 'database-id', slug: 'dhaka', district: 'Dhaka', districtBn: 'ঢাকা', nameBn: 'কাচ্চি', imageUrl: '/images/foods/kacchi.jpg' };

describe('FoodMapGraphic', () => {
  it('fills a selected district with its stable food-matched solid color', () => {
    const { container } = render(<FoodMapGraphic geojson={geojson} foods={[food]} selectedIds={['dhaka']} onDistrictClick={() => {}} />);
    expect(container.querySelector('path.district-shape')).toHaveAttribute('fill', foodColor(food));
    expect(container.querySelector('rect.map-canvas')).toHaveAttribute('fill', '#fff6df');
    expect(container.querySelector('rect.map-canvas')).toHaveAttribute('stroke', '#d8aa31');
  });

  it('allows an available district to be selected from the map', () => {
    const select = vi.fn();
    const { container } = render(<FoodMapGraphic geojson={geojson} foods={[food]} selectedIds={[]} onDistrictClick={select} />);
    fireEvent.click(container.querySelector('path.district-shape'));
    expect(select).toHaveBeenCalledWith(food);
  });
});
