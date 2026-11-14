package com.petukbangla.model;

import java.time.Instant;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("food_places")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FoodPlace {
    @Id private String id;
    @Indexed private String userId;
    private String userName;
    private String foodName;
    private String placeName;
    private String description;
    private String address;
    @Indexed private double latitude;
    @Indexed private double longitude;
    private String imageDataUrl;
    @Builder.Default private boolean active = true;
    @Builder.Default private Instant createdAt = Instant.now();
    private Instant updatedAt;
}
