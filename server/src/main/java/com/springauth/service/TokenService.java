package com.springauth.service;

import com.springauth.entity.RefreshToken;
import com.springauth.entity.User;
import com.springauth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    /**
     * Creates a new refresh token for the user.
     * Returns the RAW token (to send to client). Only the HASH is stored in DB.
     */
    @Transactional
    public String createRefreshToken(User user) {
        String rawToken = generateRandomToken();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .expiresAt(Instant.now().plusMillis(refreshTokenExpiry))
                .build();

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    /**
     * Validates a refresh token and returns the DB record.
     * Checks: exists, not revoked, not expired.
     */
    public Optional<RefreshToken> validateRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);

        return refreshTokenRepository.findByTokenHash(tokenHash)
                .filter(token -> !token.isRevoked())
                .filter(token -> !token.isExpired());
    }

    /**
     * Token rotation: revoke old token, issue new one for the same user.
     * If someone uses a revoked token, all tokens for that user are revoked (breach detection).
     */
    @Transactional
    public String rotateRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);

        RefreshToken existing = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        // Breach detection: if token is already revoked, someone stole it
        if (existing.isRevoked()) {
            refreshTokenRepository.revokeAllByUserId(existing.getUser().getId());
            throw new RuntimeException("Refresh token reuse detected — all sessions revoked");
        }

        if (existing.isExpired()) {
            throw new RuntimeException("Refresh token expired");
        }

        // Revoke old token
        existing.setRevoked(true);
        refreshTokenRepository.save(existing);

        // Issue new token for same user
        return createRefreshToken(existing.getUser());
    }

    /**
     * Revoke a single refresh token (logout).
     */
    @Transactional
    public void revokeRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);

        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    /**
     * Revoke ALL refresh tokens for a user (password change, "logout everywhere").
     */
    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUserId(user.getId());
    }

    private String generateRandomToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
