package com.petukbangla.model;

import java.time.Instant;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("users")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id private String id;
    private String name;
    @Indexed(unique = true) private String email;
    private String passwordHash;
    @Builder.Default private Role role = Role.USER;
    @Builder.Default private Instant createdAt = Instant.now();
}
