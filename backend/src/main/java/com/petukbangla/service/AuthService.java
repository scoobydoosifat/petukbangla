package com.petukbangla.service;

import static com.petukbangla.dto.AuthDtos.*;

import com.petukbangla.exception.ApiException;
import com.petukbangla.model.*;
import com.petukbangla.repository.UserRepository;
import com.petukbangla.security.JwtService;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;
    private final String dummyHash;
    public AuthService(UserRepository users, PasswordEncoder passwords, JwtService jwt) {
        this.users = users; this.passwords = passwords; this.jwt = jwt;
        this.dummyHash = passwords.encode("petuk-bangla-invalid-login-sentinel");
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) throw new ApiException(HttpStatus.CONFLICT, "An account already exists with this email.");
        User user = users.save(User.builder().name(request.name().trim()).email(email).passwordHash(passwords.encode(request.password())).build());
        return response(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim().toLowerCase(Locale.ROOT)).orElse(null);
        if (user == null) {
            passwords.matches(request.password(), dummyHash);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        if (!passwords.matches(request.password(), user.getPasswordHash())) throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        return response(user);
    }

    public UserResponse me(String id) { return map(users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."))); }
    private AuthResponse response(User user) { return new AuthResponse(jwt.create(user), map(user)); }
    private UserResponse map(User user) { return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole()); }
}
