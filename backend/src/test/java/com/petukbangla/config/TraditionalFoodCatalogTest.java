package com.petukbangla.config;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petukbangla.model.TraditionalFood;
import java.util.*;
import org.junit.jupiter.api.Test;

class TraditionalFoodCatalogTest {
    @Test void catalogContainsUniqueEdibleRecordsAcrossReferenceDistricts() throws Exception {
        try (var input = getClass().getResourceAsStream("/traditional-foods.json")) {
            assertNotNull(input);
            List<TraditionalFood> foods = new ObjectMapper().readValue(input, new TypeReference<>() {});
            assertEquals(106, foods.size());
            assertEquals(62, foods.stream().map(TraditionalFood::getDistrict).distinct().count());
            assertEquals(foods.size(), foods.stream().map(TraditionalFood::getSlug).collect(java.util.stream.Collectors.toSet()).size());
            assertTrue(foods.stream().allMatch(food -> food.getImageUrl().startsWith("/images/foods/")));
        }
    }
}
