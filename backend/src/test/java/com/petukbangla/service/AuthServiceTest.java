package com.petukbangla.service;

import static com.petukbangla.dto.AuthDtos.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.petukbangla.exception.ApiException;
import com.petukbangla.model.*;
import com.petukbangla.repository.UserRepository;
import com.petukbangla.security.JwtService;
import java.util.Optional;
import java.time.Instant;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceTest {
    @Mock UserRepository users;
    @Mock PasswordEncoder passwords;
    @Mock JwtService jwt;
    @Mock EmailTokenService tokens;
    @Mock BrevoEmailService email;
    @InjectMocks AuthService service;

    @BeforeEach void setup() { MockitoAnnotations.openMocks(this); }

    @Test void registerNormalizesEmailAndSendsConfirmation() {
        when(users.findByEmailIgnoreCase("foodie@example.com")).thenReturn(Optional.empty());
        when(passwords.encode("Password1")).thenReturn("hash");
        when(tokens.generate()).thenReturn("raw-token");
        when(tokens.hash("raw-token")).thenReturn("token-hash");
        when(users.save(any())).thenAnswer(invocation -> { User user = invocation.getArgument(0); user.setId("u1"); return user; });

        RegistrationResponse response = service.register(new RegisterRequest("Rafi", "FOODIE@EXAMPLE.COM", "Password1"));

        assertTrue(response.message().contains("ইমেইল") && response.message().contains("স্প্যাম"));
        verify(users).save(argThat(user -> user.getRole() == Role.USER && user.getPasswordHash().equals("hash") && !user.getEmailVerified()));
        verify(email).sendVerification("foodie@example.com", "Rafi", "raw-token");
    }

    @Test void duplicateRegistrationIsRejected() {
        when(users.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(User.builder().emailVerified(true).build()));
        assertThrows(ApiException.class, () -> service.register(new RegisterRequest("Rafi", "a@b.com", "Password1")));
        verify(users, never()).save(any());
    }

    @Test void verificationActivatesAccountAndConsumesToken() {
        User user = User.builder().emailVerified(false).emailVerificationExpiresAt(Instant.now().plusSeconds(60)).build();
        when(tokens.hash("raw-token")).thenReturn("token-hash");
        when(users.findByEmailVerificationTokenHash("token-hash")).thenReturn(Optional.of(user));
        service.verifyEmail(new VerifyEmailRequest("raw-token"));
        assertTrue(user.getEmailVerified());
        assertNull(user.getEmailVerificationTokenHash());
        verify(users).save(user);
    }

    @Test void forgotPasswordSendsResetLinkForVerifiedUser() {
        User user = User.builder().email("foodie@example.com").name("Rafi").emailVerified(true).build();
        when(users.findByEmailIgnoreCase("foodie@example.com")).thenReturn(Optional.of(user));
        when(tokens.generate()).thenReturn("reset-token");
        when(tokens.hash("reset-token")).thenReturn("reset-hash");
        service.forgotPassword(new ForgotPasswordRequest("FOODIE@EXAMPLE.COM"));
        verify(email).sendPasswordReset("foodie@example.com", "Rafi", "reset-token");
        assertEquals("reset-hash", user.getPasswordResetTokenHash());
    }

    @Test void resetPasswordChangesPasswordAndConsumesResetToken() {
        User user = User.builder().email("foodie@example.com").passwordResetExpiresAt(Instant.now().plusSeconds(60)).build();
        when(tokens.hash("reset-token")).thenReturn("reset-hash");
        when(users.findByPasswordResetTokenHash("reset-hash")).thenReturn(Optional.of(user));
        when(passwords.encode("NewPassword1")).thenReturn("new-hash");
        service.resetPassword(new ResetPasswordRequest("reset-token", "NewPassword1"));
        assertEquals("new-hash", user.getPasswordHash());
        assertNull(user.getPasswordResetTokenHash());
        verify(users).save(user);
    }

    @Test void loginRejectsWrongPassword() {
        User user = User.builder().email("a@b.com").passwordHash("hash").build();
        when(users.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(user));
        when(passwords.matches("wrong-pass", "hash")).thenReturn(false);
        assertThrows(ApiException.class, () -> service.login(new LoginRequest("a@b.com", "wrong-pass")));
    }
}
