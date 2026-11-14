package com.petukbangla.service;

import static com.petukbangla.dto.AuthDtos.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.petukbangla.exception.ApiException;
import com.petukbangla.model.*;
import com.petukbangla.repository.UserRepository;
import com.petukbangla.security.JwtService;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceTest {
    @Mock UserRepository users;
    @Mock PasswordEncoder passwords;
    @Mock JwtService jwt;
    @InjectMocks AuthService service;

    @BeforeEach void setup() { MockitoAnnotations.openMocks(this); }

    @Test void registerNormalizesEmailAndReturnsToken() {
        when(users.existsByEmailIgnoreCase("foodie@example.com")).thenReturn(false);
        when(passwords.encode("Password1")).thenReturn("hash");
        when(users.save(any())).thenAnswer(invocation -> { User user = invocation.getArgument(0); user.setId("u1"); return user; });
        when(jwt.create(any())).thenReturn("token");

        AuthResponse response = service.register(new RegisterRequest("Rafi", "FOODIE@EXAMPLE.COM", "Password1"));

        assertEquals("token", response.token());
        assertEquals("foodie@example.com", response.user().email());
        verify(users).save(argThat(user -> user.getRole() == Role.USER && user.getPasswordHash().equals("hash")));
    }

    @Test void duplicateRegistrationIsRejected() {
        when(users.existsByEmailIgnoreCase("a@b.com")).thenReturn(true);
        assertThrows(ApiException.class, () -> service.register(new RegisterRequest("Rafi", "a@b.com", "Password1")));
        verify(users, never()).save(any());
    }

    @Test void loginRejectsWrongPassword() {
        User user = User.builder().email("a@b.com").passwordHash("hash").build();
        when(users.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(user));
        when(passwords.matches("wrong-pass", "hash")).thenReturn(false);
        assertThrows(ApiException.class, () -> service.login(new LoginRequest("a@b.com", "wrong-pass")));
    }
}
