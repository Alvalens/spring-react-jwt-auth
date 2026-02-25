package com.springauth.service;

import com.springauth.dto.AuthResponse;
import com.springauth.dto.LoginRequest;
import com.springauth.dto.RegisterRequest;
import com.springauth.entity.RefreshToken;
import com.springauth.entity.User;
import com.springauth.exception.EmailAlreadyExistsException;
import com.springauth.exception.InvalidCredentialsException;
import com.springauth.exception.InvalidRefreshTokenException;
import com.springauth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenService tokenService;

    /**
     * Register: create user, return access token + refresh token (raw).
     * Returns String[] = { accessToken, rawRefreshToken }
     */
    @Transactional
    public AuthResult register(RegisterRequest request) {
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
        String refreshToken = tokenService.createRefreshToken(user);

        return new AuthResult(
                new AuthResponse(accessToken, user.getEmail(), user.getFirstName()),
                refreshToken
        );
    }

    /**
     * Login: validate credentials, return access token + refresh token.
     */
    @Transactional
    public AuthResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = tokenService.createRefreshToken(user);

        return new AuthResult(
                new AuthResponse(accessToken, user.getEmail(), user.getFirstName()),
                refreshToken
        );
    }

    /**
     * Refresh: validate refresh token, rotate it, issue new access token.
     */
    @Transactional
    public AuthResult refresh(String rawRefreshToken) {
        RefreshToken existing = tokenService.validateRefreshToken(rawRefreshToken)
                .orElseThrow(() -> new InvalidRefreshTokenException("Invalid or expired refresh token"));

        User user = existing.getUser();

        // Rotate: revoke old, issue new
        String newRefreshToken = tokenService.rotateRefreshToken(rawRefreshToken);
        String newAccessToken = jwtService.generateAccessToken(user);

        return new AuthResult(
                new AuthResponse(newAccessToken, user.getEmail(), user.getFirstName()),
                newRefreshToken
        );
    }

    /**
     * Logout: revoke the refresh token.
     */
    @Transactional
    public void logout(String rawRefreshToken) {
        tokenService.revokeRefreshToken(rawRefreshToken);
    }

    /**
     * Internal record to hold both the API response and the raw refresh token.
     * The controller uses this to set the cookie and return the JSON body separately.
     */
    public record AuthResult(AuthResponse response, String refreshToken) {}
}
