package com.petukbangla.repository;

import com.petukbangla.model.TraditionalFood;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TraditionalFoodRepository extends MongoRepository<TraditionalFood, String> {
    List<TraditionalFood> findByActiveTrueOrderByDistrictAscNameAsc();
    boolean existsBySlug(String slug);
}
