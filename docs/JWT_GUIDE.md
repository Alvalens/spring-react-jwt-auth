# JWT Authentication — A Complete Guide

This document explains JWT authentication from the ground up: what it is, how it compares to other approaches, how tokens are structured, and how this project implements it with refresh token rotation.

---

## Table of Contents

1. [The Problem: How Do You Keep Users Logged In?](#1-the-problem-how-do-you-keep-users-logged-in)
2. [Approach 1: Session-Based Auth](#2-approach-1-session-based-auth)
3. [Approach 2: Token-Based Auth (JWT)](#3-approach-2-token-based-auth-jwt)
4. [Sessions vs JWT — When to Use What](#4-sessions-vs-jwt--when-to-use-what)
5. [JWT Deep Dive — What's Inside a Token](#5-jwt-deep-dive--whats-inside-a-token)
6. [The Access Token Problem](#6-the-access-token-problem)
7. [Refresh Tokens — Solving the Lifespan Dilemma](#7-refresh-tokens--solving-the-lifespan-dilemma)
8. [Refresh Token Rotation — Why One Use Only](#8-refresh-token-rotation--why-one-use-only)
9. [Where to Store Tokens — The Frontend Security Problem](#9-where-to-store-tokens--the-frontend-security-problem)
10. [Our Implementation](#10-our-implementation)
11. [The Complete Flow — Step by Step](#11-the-complete-flow--step-by-step)
12. [Security Considerations](#12-security-considerations)
13. [Other Auth Approaches Worth Knowing](#13-other-auth-approaches-worth-knowing)

---

## 1. The Problem: How Do You Keep Users Logged In?

HTTP is stateless. Every request is independent — the server doesn't inherently know that request #2 came from the same person as request #1. But users expect to log in once and stay logged in. So every web application needs a mechanism to say: "this request comes from an authenticated user."

There are two fundamental approaches to solving this.

---

## 2. Approach 1: Session-Based Auth

The traditional approach. The server remembers who you are.

### How it works

```
1. User sends email + password to /login
2. Server verifies credentials
3. Server creates a "session" — a record stored in server memory (or Redis/DB)
   Session: { id: "abc123", userId: 42, createdAt: ... }
4. Server sends back a cookie: Set-Cookie: SESSION_ID=abc123
5. Browser automatically includes this cookie on every subsequent request
6. Server reads SESSION_ID from cookie → looks up session → knows who you are
```

### The key insight

The session ID is just a random string — a pointer. It means nothing by itself. All the actual data (who the user is, their permissions, when the session expires) lives on the **server**. The client just holds a reference.

### Pros

- **Simple to invalidate** — delete the session record and the user is immediately logged out
- **Server has full control** — can revoke access instantly, track active sessions, limit concurrent logins
- **Small cookie** — just a random ID, typically ~32 bytes

### Cons

- **Server-side storage** — every active user consumes memory or a DB row
- **Horizontal scaling is hard** — if you have 5 servers behind a load balancer, they all need access to the same session store (sticky sessions or centralized storage like Redis)
- **Not great for mobile/API clients** — cookies are a browser concept; mobile apps and third-party API consumers need something else

---

## 3. Approach 2: Token-Based Auth (JWT)

The modern approach. The client holds all the information.

### How it works

```
1. User sends email + password to /login
2. Server verifies credentials
3. Server creates a JWT — a self-contained token with user info baked in
   Token contains: { userId: 42, email: "...", exp: 1234567890 }
4. Server signs the token with a secret key and sends it to the client
5. Client stores the token and includes it in every request:
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
6. Server verifies the signature → trusts the data inside → knows who you are
```

### The key insight

The token itself **contains** the user data. The server doesn't need to look anything up — it just verifies the cryptographic signature to confirm the token wasn't tampered with. This is what "stateless" means: the server stores nothing per-session.

### Pros

- **No server-side storage** — the token is self-contained; server just verifies the signature
- **Horizontal scaling is trivial** — any server with the secret key can validate any token
- **Works everywhere** — browsers, mobile apps, API clients, microservices
- **Decoupled auth** — one service can issue tokens, another can verify them

### Cons

- **Hard to invalidate** — once issued, the token is valid until it expires (the server has no "session" to delete)
- **Larger payload** — a JWT is typically 500-800 bytes vs 32 bytes for a session ID
- **Sensitive data exposure** — the payload is base64-encoded (not encrypted), so anyone can read it

---

## 4. Sessions vs JWT — When to Use What

| Factor | Sessions | JWT |
|---|---|---|
| Server stores state? | Yes (memory/Redis/DB) | No (stateless) |
| Easy to invalidate? | Yes (delete session) | No (wait for expiry) |
| Horizontal scaling | Needs shared session store | Just share the secret key |
| Mobile / API friendly | Not natively | Yes |
| Token size | ~32 bytes (just an ID) | ~500-800 bytes |
| Best for | Traditional server-rendered apps | SPAs, mobile apps, microservices |

**Use sessions** when you have a monolithic server-rendered app and need instant revocation (e.g., banking).

**Use JWT** when you have a SPA, mobile app, or microservice architecture and need stateless, scalable auth.

Most modern apps (like this one) use JWT with refresh tokens to get the best of both worlds.

---

## 5. JWT Deep Dive — What's Inside a Token

A JWT (JSON Web Token) is a string with three parts separated by dots:

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNzE5MDAwMDAwLCJleHAiOjE3MTkwMDA5MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 └──────── Header ────────┘└─────────────────────────── Payload ───────────────────────────┘└─────────── Signature ──────────┘
```

### Part 1: Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Tells the server which signing algorithm was used. Common algorithms:

- **HS256** (HMAC-SHA256) — symmetric. One secret key for both signing and verifying. Simple, fast. Used when the same server signs and verifies (like this project).
- **RS256** (RSA-SHA256) — asymmetric. Private key signs, public key verifies. Used when one service issues tokens and others verify them (microservices).

### Part 2: Payload (Claims)

```json
{
  "sub": "test@test.com",
  "iat": 1719000000,
  "exp": 1719000900
}
```

Contains the actual data. These key-value pairs are called "claims":

| Claim | Meaning | Example |
|---|---|---|
| `sub` | Subject — who the token is for | User's email or ID |
| `iat` | Issued At — when the token was created | Unix timestamp |
| `exp` | Expiration — when the token becomes invalid | Unix timestamp |
| `iss` | Issuer — who created the token | Your app's name/URL |
| `aud` | Audience — who the token is intended for | Your API's URL |

You can also add custom claims (roles, permissions, etc.), but keep the payload small — it's sent with **every request**.

**Important:** The payload is base64url-encoded, **not encrypted**. Anyone can decode and read it. Never put secrets (passwords, API keys) in a JWT.

### Part 3: Signature

```
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret_key
)
```

This is the security part. The server takes the header + payload, signs them with a secret key, and produces a hash. When the token comes back in a request, the server:

1. Takes the header + payload from the token
2. Re-computes the signature using its secret key
3. Compares with the signature in the token
4. If they match → the token hasn't been tampered with → trust the data

If someone changes even one character in the payload (e.g., changing their email to an admin's email), the signature won't match and the server rejects it.

---

## 6. The Access Token Problem

JWTs are stateless — the server can't revoke them. Once issued, they're valid until expiry. This creates a dilemma:

**Short lifespan (e.g., 5 minutes)**
- If stolen, damage is limited to 5 minutes
- But users get logged out every 5 minutes — terrible UX

**Long lifespan (e.g., 30 days)**
- Great UX — users stay logged in
- But if stolen, the attacker has access for 30 days

There's no good middle ground with a single token. You need two tokens with different lifespans and different purposes.

---

## 7. Refresh Tokens — Solving the Lifespan Dilemma

The solution is a two-token system:

| | Access Token | Refresh Token |
|---|---|---|
| **Purpose** | Authenticate API requests | Get new access tokens |
| **Lifespan** | Short (5-30 min) | Long (7-30 days) |
| **Stored** | In memory (JS variable) | In HttpOnly cookie |
| **Sent with** | Every API request | Only refresh endpoint |
| **Stateless?** | Yes (JWT, no DB lookup) | No (stored in DB, can be revoked) |

### How they work together

```
Login
  → Server returns: access token (15 min) + refresh token (7 days)

Normal API call
  → Client sends access token in Authorization header
  → Server validates JWT signature → allows request

Access token expires (after 15 min)
  → API returns 401
  → Client calls /refresh with the refresh token cookie
  → Server validates refresh token against DB → issues new access token
  → Client retries the failed request with the new access token
  → User notices nothing

Refresh token expires (after 7 days of inactivity)
  → /refresh fails → user must log in again
```

### Why this is the best of both worlds

- **Short access token** → if stolen, attacker has 15 minutes max
- **Long refresh token** → user stays logged in for days
- **Refresh token is revocable** → it's stored in DB, so you can delete it (instant logout)
- **Refresh token is protected** → HttpOnly cookie, never accessible to JavaScript

---

## 8. Refresh Token Rotation — Why One Use Only

A static refresh token (one that never changes) has a weakness: if stolen, the attacker has full access for 7 days. Refresh token rotation fixes this.

### How rotation works

```
1. Client uses refresh token A to get new access token
2. Server revokes refresh token A (marks it as used in DB)
3. Server issues refresh token B (brand new, fresh 7-day window)
4. Client now holds refresh token B
5. Next refresh: B is used → B revoked → C issued → and so on
```

Each refresh token is **single-use**. After one use, it's dead.

### Breach detection

Here's the clever part. What if an attacker steals refresh token A?

**Scenario: Attacker steals token A, uses it before the real user:**

```
1. Attacker uses token A → gets new tokens (attacker now has token B)
2. Token A is revoked
3. Real user tries to use token A → it's already revoked
4. Server detects reuse of a revoked token → BREACH DETECTED
5. Server revokes ALL tokens for that user → both attacker and real user are logged out
6. User must re-login (attacker can't)
```

**Scenario: Real user uses token A first:**

```
1. Real user uses token A → gets token B → token A revoked
2. Attacker tries to use token A → it's revoked → BREACH DETECTED
3. All tokens revoked → attacker is locked out
```

Either way, the system detects the theft and kills all sessions. This is why we keep revoked tokens in the database instead of deleting them — they serve as evidence of potential theft.

---

## 9. Where to Store Tokens — The Frontend Security Problem

This is one of the most debated topics in frontend security. Here's the breakdown:

### Option 1: localStorage

```js
localStorage.setItem("access_token", token);
```

- Persists across tabs, page refreshes, browser restarts
- Vulnerable to **XSS** (Cross-Site Scripting): any JavaScript on the page can read it. A single XSS vulnerability (or a compromised npm package) gives the attacker your token.
- **Not recommended for sensitive tokens.**

### Option 2: sessionStorage

```js
sessionStorage.setItem("access_token", token);
```

- Same as localStorage but scoped to the tab — closing the tab loses the token
- Still vulnerable to XSS
- Slightly better but **still not recommended.**

### Option 3: HttpOnly Cookie

```
Set-Cookie: token=abc123; HttpOnly; Secure; SameSite=Strict; Path=/
```

- **JavaScript cannot access it** — `document.cookie` won't show it
- Immune to XSS token theft
- Sent automatically by the browser — no manual attachment needed
- Vulnerable to **CSRF** (Cross-Site Request Forgery), but mitigated by `SameSite` attribute and CSRF tokens
- **Best for refresh tokens.**

### Option 4: In-Memory (JavaScript Variable)

```js
let accessToken = null; // module-level variable
```

- Not persisted anywhere — lost on page refresh
- Cannot be stolen via XSS unless the attacker is running code during the session
- Smallest attack surface
- **Best for access tokens** (combined with refresh token to restore on page load).

### What this project does (and why)

| Token | Storage | Reasoning |
|---|---|---|
| Access token | In-memory JS variable | Shortest attack surface. If the page refreshes, `initAuth()` gets a new one via the refresh endpoint. |
| Refresh token | HttpOnly cookie | JavaScript can't read it. Sent automatically only to `/api/auth/*` endpoints. |

This combination means:
- XSS can't steal either token (one is invisible to JS, the other is a variable in a module closure)
- CSRF risk is minimized because the refresh cookie is scoped to `/api/auth` path and the API expects JSON (not form submissions)
- Page refresh works because the browser sends the cookie automatically

---

## 10. Our Implementation

### Tech stack

- **Backend**: Spring Boot 3.5, Java 21
- **Frontend**: React 19, Vite, TypeScript
- **JWT Library**: jjwt 0.12.6 (HMAC-SHA256)
- **Password Hashing**: BCrypt (via Spring Security)
- **State Management**: Zustand (frontend auth state)
- **HTTP Client**: Axios (with interceptors for token management)

### Backend architecture

```
AuthController          → REST endpoints (register, login, refresh, logout)
AuthService             → Business logic (coordinates JWT + Token services)
JwtService              → Generate and validate access tokens (stateless JWT)
TokenService            → Create, rotate, revoke refresh tokens (DB-backed)
JwtAuthenticationFilter → Intercepts every request, validates access token
SecurityConfig          → Spring Security setup (stateless, CORS, BCrypt)
```

### Database schema

**Users table:**

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | VARCHAR | Unique, used as JWT subject |
| password | VARCHAR | BCrypt hash |
| first_name | VARCHAR | Display name |
| last_name | VARCHAR | Display name |

**Refresh tokens table:**

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| token_hash | VARCHAR | SHA-256 hash of the raw token |
| user_id | UUID | Foreign key to users |
| expires_at | TIMESTAMP | When this token becomes invalid |
| revoked | BOOLEAN | Whether this token has been used/revoked |
| created_at | TIMESTAMP | When this token was issued |

The raw refresh token is never stored — only its SHA-256 hash. This means even if the database is compromised, the attacker can't use the hashes to forge tokens.

### Frontend architecture

```
axios.ts        → Axios instance with request/response interceptors
auth.ts         → API functions (login, register, refresh, logout)
authStore.ts    → Zustand store (user state, auth actions, initAuth)
ProtectedRoute  → Route guard component (redirects if not authenticated)
App.tsx         → Calls initAuth() on mount, defines route structure
```

### API endpoints

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | None | `{ email, password, firstName, lastName }` | `{ accessToken, email, firstName }` + refresh cookie |
| POST | `/api/auth/login` | None | `{ email, password }` | `{ accessToken, email, firstName }` + refresh cookie |
| POST | `/api/auth/refresh` | Cookie | None (cookie sent automatically) | `{ accessToken, email, firstName }` + new refresh cookie |
| POST | `/api/auth/logout` | Cookie | None | 204 No Content + expired cookie |

---

## 11. The Complete Flow — Step by Step

### Registration

```
Browser                          Server                          Database
  │                                │                                │
  ├─ POST /register ──────────────►│                                │
  │  { email, password,            │                                │
  │    firstName, lastName }       │                                │
  │                                ├─ BCrypt hash password ─────────►│ INSERT user
  │                                ├─ Generate access token (JWT)    │
  │                                ├─ Generate refresh token ───────►│ INSERT token_hash
  │                                │                                │
  │◄── 201 { accessToken,  ───────┤                                │
  │         email, firstName }     │                                │
  │    + Set-Cookie: refresh_token │                                │
  │                                │                                │
  ├─ Store access token in memory  │                                │
  ├─ Navigate to /dashboard        │                                │
```

### Normal API Request (access token valid)

```
Browser                          Server
  │                                │
  ├─ GET /api/some-resource ──────►│
  │  Authorization: Bearer <JWT>   │
  │                                ├─ Verify JWT signature
  │                                ├─ Check expiry
  │                                ├─ Extract user from claims
  │◄── 200 { data } ──────────────┤
```

### Token Refresh (access token expired)

```
Browser                          Server                          Database
  │                                │                                │
  ├─ GET /api/resource ───────────►│                                │
  │  Authorization: Bearer <JWT>   ├─ JWT expired                   │
  │◄── 401 Unauthorized ──────────┤                                │
  │                                │                                │
  ├─ [Axios interceptor catches]   │                                │
  │                                │                                │
  ├─ POST /refresh ───────────────►│                                │
  │  Cookie: refresh_token=XYZ     ├─ SHA-256 hash XYZ              │
  │                                ├─ Look up hash in DB ──────────►│ FOUND, not revoked
  │                                ├─ Revoke old token ────────────►│ UPDATE revoked=true
  │                                ├─ Generate new refresh token ──►│ INSERT new token_hash
  │                                ├─ Generate new access token     │
  │◄── 200 { accessToken } ───────┤                                │
  │    + Set-Cookie: new_refresh   │                                │
  │                                │                                │
  ├─ Store new access token        │                                │
  ├─ Retry original request ──────►│                                │
  │  Authorization: Bearer <new>   ├─ Valid                         │
  │◄── 200 { data } ──────────────┤                                │
```

### Page Refresh (session restoration)

```
Browser                          Server                          Database
  │                                │                                │
  ├─ [React mounts, calls          │                                │
  │   initAuth()]                  │                                │
  │                                │                                │
  ├─ POST /refresh ───────────────►│                                │
  │  Cookie: refresh_token=XYZ     ├─ Validate + rotate ──────────►│ Revoke old, insert new
  │◄── 200 { accessToken,  ───────┤                                │
  │         email, firstName }     │                                │
  │    + Set-Cookie: new_refresh   │                                │
  │                                │                                │
  ├─ Store access token in memory  │                                │
  ├─ Set user state                │                                │
  ├─ isAuthenticated = true        │                                │
  ├─ Render dashboard              │                                │
```

### Logout

```
Browser                          Server                          Database
  │                                │                                │
  ├─ POST /logout ────────────────►│                                │
  │  Cookie: refresh_token=XYZ     ├─ Revoke token ───────────────►│ UPDATE revoked=true
  │◄── 204 No Content ────────────┤                                │
  │    + Set-Cookie: refresh=""    │                                │
  │      (expires immediately)     │                                │
  │                                │                                │
  ├─ Clear access token from memory│                                │
  ├─ Set user = null               │                                │
  ├─ Navigate to /login            │                                │
```

### Breach Detection (refresh token reuse)

```
Attacker                         Server                          Database
  │                                │                                │
  ├─ POST /refresh ───────────────►│                                │
  │  Cookie: refresh_token=STOLEN  ├─ Hash STOLEN                   │
  │                                ├─ Look up in DB ──────────────►│ FOUND, but revoked=true
  │                                │                                │
  │                                ├─ REUSE DETECTED!               │
  │                                ├─ Revoke ALL user tokens ──────►│ UPDATE all revoked=true
  │                                │                                │
  │◄── 401 Unauthorized ──────────┤                                │
  │                                │                                │
  │  (Real user's session is also killed — they must re-login,      │
  │   but the attacker can't.)                                      │
```

---

## 12. Security Considerations

### What this implementation protects against

| Attack | Protection |
|---|---|
| **XSS token theft** | Access token in memory (not localStorage). Refresh token in HttpOnly cookie (invisible to JS). |
| **CSRF** | Refresh cookie scoped to `/api/auth` path. API expects JSON body, not form submissions. Stateless session (no CSRF token needed for JWT-authed requests). |
| **Token replay** | Access tokens expire in 15 minutes. Refresh tokens are single-use (rotation). |
| **Refresh token theft** | Rotation + breach detection. Reuse of a revoked token kills all sessions. |
| **Database compromise** | Refresh tokens stored as SHA-256 hashes. Raw tokens exist only in cookies. |
| **Password breach** | Passwords hashed with BCrypt (adaptive, slow, salted). |

### What this implementation does NOT protect against

| Risk | Why | Mitigation |
|---|---|---|
| **XSS code execution** | If an attacker can run JS on your page, they can make API calls using your in-memory token during the session. | CSP headers, input sanitization, dependency auditing. |
| **Man-in-the-middle** | Without HTTPS, tokens can be intercepted in transit. | Always use HTTPS in production. Set `Secure` flag on cookies. |
| **Brute force login** | No rate limiting on the login endpoint. | Add rate limiting (e.g., Spring Boot Bucket4j or API gateway). |
| **Token in logs** | Access tokens sent in Authorization header may appear in server logs. | Configure access logs to exclude Authorization headers. |

### Production checklist

- [ ] Enable HTTPS everywhere
- [ ] Set `Secure` flag on refresh token cookie (`cookie.setSecure(true)`)
- [ ] Add `SameSite=Strict` or `SameSite=Lax` to refresh cookie
- [ ] Add rate limiting to login/register endpoints
- [ ] Add scheduled cleanup job for expired/revoked refresh tokens
- [ ] Set strong JWT secret (256+ bits, from environment variable)
- [ ] Add CSP (Content Security Policy) headers
- [ ] Audit npm dependencies regularly
- [ ] Consider adding `jti` (JWT ID) claim for access token revocation if needed

---

## 13. Other Auth Approaches Worth Knowing

### OAuth 2.0 / OpenID Connect

Not an alternative to JWT — it's a **protocol** for delegated authorization. "Sign in with Google/GitHub" uses OAuth. The tokens it issues are often JWTs. Use this when you want third-party login providers or when you're building an API that third-party apps will consume.

### API Keys

Simple, long-lived strings. Good for server-to-server communication where there's no "user" logging in. Not suitable for end-user auth — no expiry, no rotation, hard to scope.

### Session Tokens + Redis

The modern version of session-based auth. Instead of in-memory sessions, use Redis as a centralized session store. Combines the revocability of sessions with the scalability of a distributed cache. Good choice if you need instant revocation and already run Redis.

### Paseto (Platform-Agnostic Security Tokens)

A newer alternative to JWT that aims to fix JWT's footguns (algorithm confusion attacks, `none` algorithm, etc.). Simpler, more opinionated. Less ecosystem support than JWT but gaining traction.

### Magic Links / Passwordless

Send a one-time login link via email. No password to steal. Used by Slack, Notion, etc. Simple to implement but dependent on email delivery speed and security.

---

## Further Reading

- [RFC 7519 — JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519) — The JWT specification
- [RFC 6749 — OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749) — The OAuth 2.0 framework
- [Auth0 — Refresh Token Rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation) — Detailed explanation of rotation and breach detection
- [OWASP — JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html) — Security best practices
- [jjwt Documentation](https://github.com/jwtk/jjwt) — The JWT library used in this project
