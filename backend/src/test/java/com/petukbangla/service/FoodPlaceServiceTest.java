package com.petukbangla.service;

import static com.petukbangla.dto.FoodPlaceDtos.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.petukbangla.exception.ApiException;
import com.petukbangla.model.*;
import com.petukbangla.repository.*;
import java.util.Optional;
import org.junit.jupiter.api.*;

class FoodPlaceServiceTest {
    FoodPlaceRepository places;
    UserRepository users;
    FoodPlaceService service;

    @BeforeEach void setup() { places = mock(FoodPlaceRepository.class); users = mock(UserRepository.class); service = new FoodPlaceService(places, users); }

    @Test void signedInUserCanCreateDhakaPin() {
        when(users.findById("u1")).thenReturn(Optional.of(User.builder().id("u1").name("Nila").build()));
        when(places.save(any())).thenAnswer(invocation -> { FoodPlace place = invocation.getArgument(0); place.setId("p1"); return place; });
        Response result = service.create("u1", new CreateRequest("Kala bhuna", "Old Dhaka", "A deeply spiced local plate", "Nazira Bazar", 23.715, 90.407, null));
        assertEquals("p1", result.id());
        assertTrue(result.ownedByCurrentUser());
        assertEquals("Nila", result.userName());
    }

    @Test void rejectsUnsupportedPhotoPayload() {
        when(users.findById("u1")).thenReturn(Optional.of(User.builder().id("u1").name("Nila").build()));
        CreateRequest request = new CreateRequest("Food", "Place", "Long enough description", "Dhaka", 23.8, 90.4, "https://unsafe.example/image.jpg");
        assertThrows(ApiException.class, () -> service.create("u1", request));
    }

    @Test void userCannotDeleteAnotherUsersPin() {
        when(places.findById("p1")).thenReturn(Optional.of(FoodPlace.builder().id("p1").userId("owner").build()));
        assertThrows(ApiException.class, () -> service.delete("p1", "someone-else", false));
        verify(places, never()).save(any());
    }

    @Test void adminCanModerateAnyPin() {
        FoodPlace place = FoodPlace.builder().id("p1").userId("owner").active(true).build();
        when(places.findById("p1")).thenReturn(Optional.of(place));
        service.delete("p1", "admin", true);
        assertFalse(place.isActive());
        verify(places).save(place);
    }
}
