package com.petukbangla.controller;

import com.petukbangla.dto.FoodDtos.FoodResponse;
import com.petukbangla.service.TraditionalFoodService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/foods")
public class TraditionalFoodController {
    private final TraditionalFoodService foods;
    public TraditionalFoodController(TraditionalFoodService foods) { this.foods = foods; }
    @GetMapping public List<FoodResponse> all() { return foods.all(); }
}
