package com.petukbangla.service;

import static com.petukbangla.dto.AuthDtos.*;
import com.petukbangla.dto.UserDtos.MessageResponse;

import com.petukbangla.exception.ApiException;
import com.petukbangla.model.*;
import com.petukbangla.repository.UserRepository;
import com.petukbangla.security.JwtService;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;
    private final EmailTokenService tokens;
    private final BrevoEmailService emailService;
    private final String dummyHash;
    public AuthService(UserRepository users, PasswordEncoder passwords, JwtService jwt, EmailTokenService tokens, BrevoEmailService email) {
        this.users = users; this.passwords = passwords; this.jwt = jwt; this.tokens = tokens; this.emailService = email;
        this.dummyHash = passwords.encode("petuk-bangla-invalid-login-sentinel");
    }

    public RegistrationResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        User user = users.findByEmailIgnoreCase(email).orElse(null);
        if (user != null && !Boolean.FALSE.equals(user.getEmailVerified()))
            throw new ApiException(HttpStatus.CONFLICT, "An account already exists with this email.");
        if (user == null) user = User.builder().name(request.name().trim()).email(email).build();
        user.setName(request.name().trim());
        user.setPasswordHash(passwords.encode(request.password()));
        user.setEmailVerified(false);
        String rawToken = tokens.generate();
        user.setEmailVerificationTokenHash(tokens.hash(rawToken));
        user.setEmailVerificationExpiresAt(Instant.now().plus(Duration.ofHours(24)));
        users.save(user);
        emailService.sendVerification(user.getEmail(), user.getName(), rawToken);
        return new RegistrationResponse("সাইন ইন করার আগে আপনার ইমেইল নিশ্চিত করুন। ইমেইল ইনবক্স অথবা স্প্যাম ইনবক্স চেক করুন।");
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim().toLowerCase(Locale.ROOT)).orElse(null);
        if (user == null) {
            passwords.matches(request.password(), dummyHash);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        if (Boolean.FALSE.equals(user.getEmailVerified())) throw new ApiException(HttpStatus.FORBIDDEN, "সাইন ইন করার আগে মেইল কনফার্ম করুন। মেইল ইনবক্স অথবা স্প্যাম ইনবক্স চেক করুন।");
        if (!passwords.matches(request.password(), user.getPasswordHash())) throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        return response(user);
    }

    public MessageResponse verifyEmail(VerifyEmailRequest request) {
        User user = users.findByEmailVerificationTokenHash(tokens.hash(request.token())).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "This confirmation link is invalid or has expired."));
        if (user.getEmailVerificationExpiresAt() == null || user.getEmailVerificationExpiresAt().isBefore(Instant.now()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "This confirmation link is invalid or has expired.");
        user.setEmailVerified(true);
        user.setEmailVerificationTokenHash(null);
        user.setEmailVerificationExpiresAt(null);
        users.save(user);
        return new MessageResponse("Your email has been confirmed. You can now sign in.");
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String emailAddress = request.email().trim().toLowerCase(Locale.ROOT);
        User user = users.findByEmailIgnoreCase(emailAddress).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No user is registered with this email."));
        if (Boolean.FALSE.equals(user.getEmailVerified())) throw new ApiException(HttpStatus.NOT_FOUND, "No user is registered with this email.");
        String rawToken = tokens.generate();
        user.setPasswordResetTokenHash(tokens.hash(rawToken));
        user.setPasswordResetExpiresAt(Instant.now().plus(Duration.ofMinutes(30)));
        users.save(user);
        emailService.sendPasswordReset(user.getEmail(), user.getName(), rawToken);
        return new MessageResponse("A password change link has been sent to your email.");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = users.findByPasswordResetTokenHash(tokens.hash(request.token())).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "This password change link is invalid or has expired."));
        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(Instant.now()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "This password change link is invalid or has expired.");
        user.setPasswordHash(passwords.encode(request.password()));
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetExpiresAt(null);
        users.save(user);
        return new MessageResponse("Your password has been changed. You can now sign in.");
    }

    public UserResponse me(String id) { return map(users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."))); }
    private AuthResponse response(User user) { return new AuthResponse(jwt.create(user), map(user)); }
    private UserResponse map(User user) { return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole()); }
}
