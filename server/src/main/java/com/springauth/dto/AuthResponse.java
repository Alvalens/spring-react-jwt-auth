package com.springauth.dto;

public record AuthResponse(
        String accessToken,
        String email,
        String firstName
) {}
