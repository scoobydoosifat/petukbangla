package com.petukbangla.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;

public final class FoodPlaceDtos {
    private FoodPlaceDtos() {}

    public record CreateRequest(
        @NotBlank @Size(max = 80) String foodName,
        @NotBlank @Size(max = 100) String placeName,
        @NotBlank @Size(min = 10, max = 600) String description,
        @NotBlank @Size(max = 180) String address,
        @DecimalMin("23.60") @DecimalMax("24.10") double latitude,
        @DecimalMin("90.20") @DecimalMax("90.60") double longitude,
        @Size(max = 1100000) String imageDataUrl
    ) {}

    public record Response(String id, String userId, String userName, String foodName, String placeName,
                           String description, String address, double latitude, double longitude,
                           String imageDataUrl, Instant createdAt, boolean ownedByCurrentUser) {}
}
