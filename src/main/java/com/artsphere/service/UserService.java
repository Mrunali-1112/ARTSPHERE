package com.artsphere.service;

import com.artsphere.model.User;
import com.artsphere.model.dto.RegisterRequest;

import java.util.Optional;

public interface UserService {

    User register(RegisterRequest request);

    Optional<User> findById(Long id);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);
}
