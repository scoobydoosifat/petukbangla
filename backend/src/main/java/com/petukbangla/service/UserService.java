package com.petukbangla.service;

import static com.petukbangla.dto.UserDtos.*;

import com.petukbangla.exception.ApiException;
import com.petukbangla.model.FoodPlace;
import com.petukbangla.model.User;
import com.petukbangla.repository.FoodPlaceRepository;
import com.petukbangla.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository users;
    private final FoodPlaceRepository places;
    private final PasswordEncoder passwords;

    public UserService(UserRepository users, FoodPlaceRepository places, PasswordEncoder passwords) {
        this.users = users;
        this.places = places;
        this.passwords = passwords;
    }

    public MessageResponse changePassword(String userId, ChangePasswordRequest request) {
        User user = findUser(userId);
        verifyPassword(request.currentPassword(), user);
        if (passwords.matches(request.newPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be different from the current password.");
        }
        user.setPasswordHash(passwords.encode(request.newPassword()));
        users.save(user);
        return new MessageResponse("Password updated successfully.");
    }

    public void deleteAccount(String userId, DeleteAccountRequest request) {
        User user = findUser(userId);
        verifyPassword(request.password(), user);
        List<FoodPlace> userPlaces = places.findByUserIdOrderByCreatedAtDesc(userId);
        Instant now = Instant.now();
        userPlaces.forEach(place -> { place.setActive(false); place.setUpdatedAt(now); });
        if (!userPlaces.isEmpty()) places.saveAll(userPlaces);
        users.delete(user);
    }

    private User findUser(String id) {
        return users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
    }

    private void verifyPassword(String rawPassword, User user) {
        if (!passwords.matches(rawPassword, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Current password is incorrect.");
        }
    }
}
