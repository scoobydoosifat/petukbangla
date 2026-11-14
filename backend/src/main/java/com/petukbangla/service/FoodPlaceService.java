package com.petukbangla.service;

import static com.petukbangla.dto.FoodPlaceDtos.*;

import com.petukbangla.exception.ApiException;
import com.petukbangla.model.*;
import com.petukbangla.repository.*;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class FoodPlaceService {
    private final FoodPlaceRepository places;
    private final UserRepository users;
    public FoodPlaceService(FoodPlaceRepository places, UserRepository users) { this.places = places; this.users = users; }

    public List<Response> all(String currentUserId) { return places.findTop500ByActiveTrueOrderByCreatedAtDesc().stream().map(p -> map(p, currentUserId)).toList(); }

    public Response create(String userId, CreateRequest request) {
        User user = users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please sign in again."));
        validateImage(request.imageDataUrl());
        FoodPlace place = FoodPlace.builder().userId(userId).userName(user.getName()).foodName(request.foodName().trim())
            .placeName(request.placeName().trim()).description(request.description().trim()).address(request.address().trim())
            .latitude(request.latitude()).longitude(request.longitude()).imageDataUrl(blankToNull(request.imageDataUrl())).build();
        return map(places.save(place), userId);
    }

    public void delete(String id, String userId, boolean admin) {
        FoodPlace place = places.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Food place not found."));
        if (!admin && !place.getUserId().equals(userId)) throw new ApiException(HttpStatus.FORBIDDEN, "You can only remove your own pins.");
        place.setActive(false); place.setUpdatedAt(Instant.now()); places.save(place);
    }

    private void validateImage(String value) {
        if (value == null || value.isBlank()) return;
        if (!(value.startsWith("data:image/jpeg;base64,") || value.startsWith("data:image/png;base64,") || value.startsWith("data:image/webp;base64,")))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Photo must be JPEG, PNG, or WebP.");
    }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }
    private Response map(FoodPlace p, String currentUserId) { return new Response(p.getId(), p.getUserId(), p.getUserName(), p.getFoodName(), p.getPlaceName(), p.getDescription(), p.getAddress(), p.getLatitude(), p.getLongitude(), p.getImageDataUrl(), p.getCreatedAt(), p.getUserId().equals(currentUserId)); }
}
