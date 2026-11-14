package com.petukbangla.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("traditional_foods")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TraditionalFood {
    @Id private String id;
    @Indexed(unique = true) private String slug;
    @Indexed private String district;
    private String districtBn;
    private String division;
    private String name;
    private String nameBn;
    private String emoji;
    private String imageUrl;
    private String imageCredit;
    private String description;
    @Builder.Default private boolean active = true;
}
