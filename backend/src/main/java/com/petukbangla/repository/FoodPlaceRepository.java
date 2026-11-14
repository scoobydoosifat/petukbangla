package com.petukbangla.repository;

import com.petukbangla.model.FoodPlace;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FoodPlaceRepository extends MongoRepository<FoodPlace, String> {
    List<FoodPlace> findTop500ByActiveTrueOrderByCreatedAtDesc();
    List<FoodPlace> findByUserIdOrderByCreatedAtDesc(String userId);
}
