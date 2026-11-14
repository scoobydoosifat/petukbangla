package com.petukbangla.security;

import com.petukbangla.model.User;
import com.petukbangla.repository.UserRepository;
import java.util.List;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public CustomUserDetailsService(UserRepository users) { this.users = users; }

    @Override public UserDetails loadUserByUsername(String id) {
        User user = users.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(user.getId(), user.getPasswordHash(),
            List.of(() -> "ROLE_" + user.getRole().name()));
    }
}
