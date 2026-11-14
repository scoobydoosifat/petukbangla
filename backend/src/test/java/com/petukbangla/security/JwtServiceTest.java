package com.petukbangla.security;

import static org.junit.jupiter.api.Assertions.*;

import com.petukbangla.model.*;
import org.junit.jupiter.api.Test;

class JwtServiceTest {
    @Test void createsAndValidatesUserToken() {
        JwtService service = new JwtService("a-secure-test-secret-that-is-longer-than-32-bytes", 60_000);
        String token = service.create(User.builder().id("u-42").email("food@example.com").role(Role.USER).build());
        assertTrue(service.valid(token));
        assertEquals("u-42", service.userId(token));
    }

    @Test void rejectsMalformedToken() {
        JwtService service = new JwtService("a-secure-test-secret-that-is-longer-than-32-bytes", 60_000);
        assertFalse(service.valid("not-a-jwt"));
    }
}
