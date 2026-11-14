package com.petukbangla.controller;

import static com.petukbangla.dto.UserDtos.*;

import com.petukbangla.service.UserService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/users/me")
public class UserController {
    private final UserService users;
    public UserController(UserService users) { this.users = users; }

    @PutMapping("/password")
    public MessageResponse changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        return users.changePassword(principal.getName(), request);
    }

    @DeleteMapping @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(Principal principal, @Valid @RequestBody DeleteAccountRequest request) {
        users.deleteAccount(principal.getName(), request);
    }
}
