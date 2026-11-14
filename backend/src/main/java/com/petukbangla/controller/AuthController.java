package com.petukbangla.controller;

import static com.petukbangla.dto.AuthDtos.*;
import com.petukbangla.dto.UserDtos.MessageResponse;

import com.petukbangla.service.AuthService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }
    @PostMapping("/register") public RegistrationResponse register(@Valid @RequestBody RegisterRequest request) { return auth.register(request); }
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest request) { return auth.login(request); }
    @PostMapping("/verify-email") public MessageResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) { return auth.verifyEmail(request); }
    @PostMapping("/forgot-password") public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) { return auth.forgotPassword(request); }
    @PostMapping("/reset-password") public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) { return auth.resetPassword(request); }
    @GetMapping("/me") public UserResponse me(Principal principal) { return auth.me(principal.getName()); }
}
