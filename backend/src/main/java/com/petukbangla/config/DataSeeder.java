package com.petukbangla.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petukbangla.model.*;
import com.petukbangla.repository.*;
import java.io.IOException;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final TraditionalFoodRepository foods;
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final ObjectMapper objectMapper;
    private final String adminName;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(TraditionalFoodRepository foods, UserRepository users, PasswordEncoder passwords,
                      ObjectMapper objectMapper,
                      @Value("${app.admin.name}") String adminName,
                      @Value("${app.admin.email}") String adminEmail,
                      @Value("${app.admin.password}") String adminPassword) {
        this.foods = foods;
        this.users = users;
        this.passwords = passwords;
        this.objectMapper = objectMapper;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override public void run(String... args) {
        seedAdmin();
        seedFoods();
    }

    private void seedAdmin() {
        if (!adminEmail.isBlank() && !adminPassword.isBlank() && !users.existsByEmailIgnoreCase(adminEmail)) {
            users.save(User.builder().name(adminName).email(adminEmail.toLowerCase(Locale.ROOT))
                .passwordHash(passwords.encode(adminPassword)).role(Role.ADMIN).build());
        }
    }

    private void seedFoods() {
        try (var input = new ClassPathResource("traditional-foods.json").getInputStream()) {
            List<TraditionalFood> seeds = objectMapper.readValue(input, new TypeReference<>() {});
            seeds.stream().filter(seed -> !foods.existsBySlug(seed.getSlug())).forEach(foods::save);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load the traditional-food seed catalog.", exception);
        }
    }
}
