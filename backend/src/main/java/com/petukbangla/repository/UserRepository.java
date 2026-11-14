package com.petukbangla.repository;

import com.petukbangla.model.User;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByEmailVerificationTokenHash(String tokenHash);
    Optional<User> findByPasswordResetTokenHash(String tokenHash);
    boolean existsByEmailIgnoreCase(String email);
}
