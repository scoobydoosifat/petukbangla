package com.petukbangla.security;

import com.petukbangla.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this(secret, expirationMs, "development");
    }

    @Autowired
    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs,
                      @Value("${app.environment:development}") String environment) {
        if (secret == null || secret.length() < 32) throw new IllegalStateException("JWT_SECRET must contain at least 32 characters.");
        if ("production".equalsIgnoreCase(environment) && secret.contains("development-secret"))
            throw new IllegalStateException("A unique JWT_SECRET is required in production.");
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String create(User user) {
        Instant now = Instant.now();
        return Jwts.builder().subject(user.getId()).claim("email", user.getEmail()).claim("role", user.getRole().name())
            .issuedAt(Date.from(now)).expiration(Date.from(now.plusMillis(expirationMs))).signWith(key).compact();
    }

    public String userId(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean valid(String token) {
        try { userId(token); return true; } catch (JwtException | IllegalArgumentException exception) { return false; }
    }
}
