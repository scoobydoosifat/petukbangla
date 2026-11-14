package com.petukbangla.dto;

public final class FoodDtos {
    private FoodDtos() {}
    public record FoodResponse(String id, String slug, String district, String districtBn, String division,
                               String name, String nameBn, String emoji, String imageUrl,
                               String imageCredit, String description) {}
}
