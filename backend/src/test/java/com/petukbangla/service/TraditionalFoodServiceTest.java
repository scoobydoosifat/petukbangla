package com.petukbangla.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.petukbangla.model.TraditionalFood;
import com.petukbangla.repository.TraditionalFoodRepository;
import java.util.List;
import org.junit.jupiter.api.Test;

class TraditionalFoodServiceTest {
    @Test void returnsMappedActiveFoods() {
        TraditionalFoodRepository repository = mock(TraditionalFoodRepository.class);
        TraditionalFood food = TraditionalFood.builder().id("f1").slug("dhaka").district("Dhaka").districtBn("ঢাকা")
            .division("Dhaka").name("Kacchi").nameBn("কাচ্চি").emoji("🍛").active(true).build();
        when(repository.findByActiveTrueOrderByDistrictAscNameAsc()).thenReturn(List.of(food));
        var result = new TraditionalFoodService(repository).all();
        assertEquals(1, result.size());
        assertEquals("কাচ্চি", result.getFirst().nameBn());
    }
}
