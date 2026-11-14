package com.petukbangla.controller;

import static com.petukbangla.dto.FoodPlaceDtos.*;

import com.petukbangla.service.FoodPlaceService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/places")
public class FoodPlaceController {
    private final FoodPlaceService places;
    public FoodPlaceController(FoodPlaceService places) { this.places = places; }
    @GetMapping public List<Response> all(Principal principal) { return places.all(principal == null ? "" : principal.getName()); }
    @PostMapping public Response create(Principal principal, @Valid @RequestBody CreateRequest request) { return places.create(principal.getName(), request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable String id, Authentication auth) {
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        places.delete(id, auth.getName(), admin);
    }
}
