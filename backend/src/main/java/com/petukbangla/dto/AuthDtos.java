package com.petukbangla.dto;

import com.petukbangla.model.Role;
import com.petukbangla.dto.UserDtos.MessageResponse;
import jakarta.validation.constraints.*;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 60) String name,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 8, max = 72) String password
    ) {}

    public record LoginRequest(@NotBlank @Email @Size(max = 120) String email,
                               @NotBlank @Size(max = 72) String password) {}
    public record VerifyEmailRequest(@NotBlank String token) {}
    public record ForgotPasswordRequest(@NotBlank @Email @Size(max = 120) String email) {}
    public record ResetPasswordRequest(@NotBlank String token,
                                       @NotBlank @Size(min = 8, max = 72) String password) {}
    public record RegistrationResponse(String message) {}
    public record UserResponse(String id, String name, String email, Role role) {}
    public record AuthResponse(String token, UserResponse user) {}
}
