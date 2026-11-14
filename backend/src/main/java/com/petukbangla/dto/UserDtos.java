package com.petukbangla.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class UserDtos {
    private UserDtos() {}

    public record ChangePasswordRequest(
        @NotBlank @Size(max = 72) String currentPassword,
        @NotBlank @Size(min = 8, max = 72) String newPassword
    ) {}

    public record DeleteAccountRequest(@NotBlank @Size(max = 72) String password) {}
    public record MessageResponse(String message) {}
}
