import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  email: string;
  firstName: string;
}

export interface ApiError {
  status: number;
  error: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export function login(data: LoginRequest) {
  return api.post<AuthResponse>("/api/auth/login", data);
}

export function register(data: RegisterRequest) {
  return api.post<AuthResponse>("/api/auth/register", data);
}

export function refresh() {
  return api.post<AuthResponse>("/api/auth/refresh");
}

export function logout() {
  return api.post<void>("/api/auth/logout");
}
