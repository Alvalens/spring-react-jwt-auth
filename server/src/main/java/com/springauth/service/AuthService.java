package com.springauth.service;

import com.springauth.dto.AuthResponse;
import com.springauth.dto.RegisterRequest;
import com.springauth.entity.User;
import com.springauth.exception.EmailAlreadyExistsException;
import com.springauth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .build();

        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);

        return new AuthResponse(accessToken, user.getEmail(), user.getFirstName());
    }
}
