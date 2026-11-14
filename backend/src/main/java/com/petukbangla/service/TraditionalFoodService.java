package com.petukbangla.service;

import com.petukbangla.dto.FoodDtos.FoodResponse;
import com.petukbangla.model.TraditionalFood;
import com.petukbangla.repository.TraditionalFoodRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TraditionalFoodService {
    private final TraditionalFoodRepository foods;
    public TraditionalFoodService(TraditionalFoodRepository foods) { this.foods = foods; }
    public List<FoodResponse> all() { return foods.findByActiveTrueOrderByDistrictAscNameAsc().stream().map(this::map).toList(); }
    private FoodResponse map(TraditionalFood f) { return new FoodResponse(f.getId(), f.getSlug(), f.getDistrict(), f.getDistrictBn(), f.getDivision(), f.getName(), f.getNameBn(), f.getEmoji(), f.getImageUrl(), f.getImageCredit(), f.getDescription()); }
}
