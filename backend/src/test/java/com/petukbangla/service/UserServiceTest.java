package com.petukbangla.service;

import static com.petukbangla.dto.UserDtos.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.petukbangla.exception.ApiException;
import com.petukbangla.model.FoodPlace;
import com.petukbangla.model.User;
import com.petukbangla.repository.FoodPlaceRepository;
import com.petukbangla.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserServiceTest {
    @Mock UserRepository users;
    @Mock FoodPlaceRepository places;
    @Mock PasswordEncoder passwords;
    @InjectMocks UserService service;

    @BeforeEach void setup() { MockitoAnnotations.openMocks(this); }

    @Test void changesPasswordAfterVerifyingCurrentPassword() {
        User user = User.builder().id("u1").passwordHash("old-hash").build();
        when(users.findById("u1")).thenReturn(Optional.of(user));
        when(passwords.matches("current-pass", "old-hash")).thenReturn(true);
        when(passwords.matches("new-password", "old-hash")).thenReturn(false);
        when(passwords.encode("new-password")).thenReturn("new-hash");

        MessageResponse response = service.changePassword("u1", new ChangePasswordRequest("current-pass", "new-password"));

        assertEquals("new-hash", user.getPasswordHash());
        assertEquals("Password updated successfully.", response.message());
        verify(users).save(user);
    }

    @Test void rejectsPasswordChangeWhenCurrentPasswordIsWrong() {
        User user = User.builder().id("u1").passwordHash("old-hash").build();
        when(users.findById("u1")).thenReturn(Optional.of(user));
        when(passwords.matches("wrong-pass", "old-hash")).thenReturn(false);

        assertThrows(ApiException.class, () -> service.changePassword("u1", new ChangePasswordRequest("wrong-pass", "new-password")));
        verify(users, never()).save(any());
    }

    @Test void deletesAccountAndHidesItsPublishedPins() {
        User user = User.builder().id("u1").passwordHash("hash").build();
        FoodPlace place = FoodPlace.builder().id("p1").userId("u1").active(true).build();
        when(users.findById("u1")).thenReturn(Optional.of(user));
        when(passwords.matches("correct-pass", "hash")).thenReturn(true);
        when(places.findByUserIdOrderByCreatedAtDesc("u1")).thenReturn(List.of(place));

        service.deleteAccount("u1", new DeleteAccountRequest("correct-pass"));

        assertFalse(place.isActive());
        assertNotNull(place.getUpdatedAt());
        verify(places).saveAll(List.of(place));
        verify(users).delete(user);
    }

    @Test void rejectsAccountDeletionWhenPasswordIsWrong() {
        User user = User.builder().id("u1").passwordHash("hash").build();
        when(users.findById("u1")).thenReturn(Optional.of(user));
        when(passwords.matches("wrong-pass", "hash")).thenReturn(false);

        assertThrows(ApiException.class, () -> service.deleteAccount("u1", new DeleteAccountRequest("wrong-pass")));
        verify(users, never()).delete(any());
        verifyNoInteractions(places);
    }
}
