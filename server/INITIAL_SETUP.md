# Spring Boot JWT Auth — Initial Setup From Scratch

A step-by-step walkthrough of how this project was built from zero.
Use this as a learning reference for understanding Spring Boot fundamentals.

---

## Table of Contents

1. [Project Init & Gradle](#1-project-init--gradle)
2. [Dependencies Explained](#2-dependencies-explained)
3. [Configuration (application.yml)](#3-configuration-applicationyml)
4. [Project Structure](#4-project-structure)
5. [Database with Docker](#5-database-with-docker)
6. [Entity & Repository Layer](#6-entity--repository-layer)
7. [DTOs with Java Records](#7-dtos-with-java-records)
8. [JWT Service](#8-jwt-service)
9. [Spring Security Config](#9-spring-security-config)
10. [Authentication Filter](#10-authentication-filter)
11. [Service & Controller Layer](#11-service--controller-layer)
12. [Global Exception Handling](#12-global-exception-handling)

---

## 1. Project Init & Gradle

### What is Gradle?

Gradle is a build tool (like npm for Node.js). It handles:
- **Dependency management** — downloading libraries (jars) from Maven Central
- **Compilation** — `.java` → `.class`
- **Running the app** — `./gradlew bootRun`
- **Packaging** — building a `.jar` you can deploy

### Gradle Wrapper (`gradlew`)

The wrapper is a small script + jar committed to your repo. It means anyone cloning the project
doesn't need Gradle installed globally — `./gradlew` downloads the correct version automatically.

```
gradlew              ← Unix shell script
gradlew.bat          ← Windows batch script
gradle/wrapper/
├── gradle-wrapper.jar         ← tiny bootstrap binary
└── gradle-wrapper.properties  ← specifies Gradle version (8.14.4)
```

We got these files from [Spring Initializr](https://start.spring.io) by downloading a starter zip
via its API and extracting only the wrapper files:

```bash
curl -sL -o starter.zip "https://start.spring.io/starter.zip?type=gradle-project-kotlin&language=java&bootVersion=3.5.2&groupId=com.springauth&artifactId=server&javaVersion=21"
unzip -o starter.zip "gradle/wrapper/*" "gradlew" "gradlew.bat"
```

### build.gradle.kts (Kotlin DSL)

This is the heart of the build config. The `.kts` means it uses Kotlin syntax instead of Groovy.

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.2"         // Spring Boot plugin
    id("io.spring.dependency-management") version "1.1.7"  // Auto-manages dependency versions
}
```

**Why `io.spring.dependency-management`?** It lets you write `spring-boot-starter-web` without
specifying a version — the plugin ensures all Spring deps are compatible with your Boot version.

### Java Toolchain (auto-download)

In `settings.gradle.kts`:

```kotlin
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}
```

This auto-downloads Java 21 from Adoptium if it's not on your machine.
Without it, you'd need to manually install JDK 21. First build is slow (~90s) due to download,
subsequent builds are fast (~8s).

---

## 2. Dependencies Explained

Each dependency in `build.gradle.kts` and what it does:

| Dependency | Scope | Purpose |
|---|---|---|
| `spring-boot-starter-web` | implementation | Embedded Tomcat, REST controllers, JSON serialization (Jackson) |
| `spring-boot-starter-security` | implementation | Authentication/authorization framework, password encoding, security filters |
| `spring-boot-starter-data-jpa` | implementation | Hibernate ORM + Spring Data repositories (write SQL with Java interfaces) |
| `spring-boot-starter-validation` | implementation | `@Valid`, `@NotBlank`, `@Email`, `@Size` — request body validation |
| `postgresql` | runtimeOnly | JDBC driver for PostgreSQL (only needed at runtime, not compile time) |
| `jjwt-api` | implementation | JWT creation and parsing API |
| `jjwt-impl` | runtimeOnly | JWT implementation (separated so your code depends on API, not impl) |
| `jjwt-jackson` | runtimeOnly | JWT JSON serialization via Jackson |
| `lombok` | compileOnly + annotationProcessor | Generates getters/setters/constructors at compile time via annotations |

### Scope keywords

- **implementation** — needed at compile time AND runtime
- **runtimeOnly** — only needed when the app runs (not during compilation)
- **compileOnly** — only needed during compilation (stripped from final jar)
- **annotationProcessor** — runs during compilation to generate code (Lombok)

---

## 3. Configuration (application.yml)

Spring Boot reads `src/main/resources/application.yml` at startup:

```yaml
server:
  port: 8443                                    # default is 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/auth_db  # JDBC connection string
    username: auth_user
    password: auth_pass
  jpa:
    hibernate:
      ddl-auto: update    # Hibernate auto-creates/updates tables from entities
    open-in-view: false   # Disables lazy loading in controllers (best practice)

app:
  jwt:
    secret: 404E635266...   # Base64-encoded HMAC key for signing JWTs
    access-token-expiry: 900000  # 15 minutes in milliseconds
```

### `ddl-auto` options

| Value | Behavior | When to use |
|---|---|---|
| `update` | Creates/alters tables to match entities | Development |
| `validate` | Only checks schema matches entities | Production |
| `create-drop` | Drops and recreates on every startup | Testing |
| `none` | Does nothing | Production with Flyway/Liquibase migrations |

### How `app.jwt.*` works

Custom properties under `app:` are not part of Spring — they're our own config.
We read them in Java with `@Value`:

```java
@Value("${app.jwt.secret}")
private String secret;
```

---

## 4. Project Structure

```
server/src/main/java/com/springauth/
├── AuthApplication.java          ← Entry point (@SpringBootApplication)
├── config/                       ← Security & filter configuration
│   ├── SecurityConfig.java       ← HTTP security rules, CORS, password encoder
│   └── JwtAuthenticationFilter.java  ← Reads JWT from requests
├── controller/                   ← REST endpoints (thin layer, delegates to services)
│   └── AuthController.java
├── dto/                          ← Request/response objects (Java records)
│   ├── RegisterRequest.java
│   └── AuthResponse.java
├── entity/                       ← JPA entities (maps to database tables)
│   └── User.java
├── exception/                    ← Custom exceptions + global handler
│   ├── EmailAlreadyExistsException.java
│   └── GlobalExceptionHandler.java
├── repository/                   ← Database access (Spring Data interfaces)
│   └── UserRepository.java
└── service/                      ← Business logic
    ├── AuthService.java
    └── JwtService.java
```

### Why this structure?

This follows the **layered architecture** pattern:

```
Request → Controller → Service → Repository → Database
                         ↓
                      JwtService (utility)
```

- **Controller**: receives HTTP requests, validates input, returns responses. No business logic.
- **Service**: contains all business logic (check duplicate email, hash password, generate token).
- **Repository**: data access only. Spring Data auto-implements queries from method names.
- **Entity**: maps Java class ↔ database table via JPA annotations.
- **DTO**: data transfer objects. What goes in/out of the API. Separate from entities.

### Why separate DTOs from Entities?

Never expose your entity directly in API responses because:
- Entity has `passwordHash` — you'd leak it
- Entity structure might not match what the API consumer needs
- Changing the DB schema would break your API contract

---

## 5. Database with Docker

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:17-alpine   # Alpine = minimal image (~80MB vs ~400MB)
    container_name: auth-postgres
    ports:
      - "5432:5432"             # host:container — access DB at localhost:5432
    environment:
      POSTGRES_DB: auth_db      # auto-creates this database on first start
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: auth_pass
    volumes:
      - pgdata:/var/lib/postgresql/data  # persist data across container restarts

volumes:
  pgdata:   # named volume — survives `docker compose down`
```

### Commands

```bash
docker compose up -d      # start Postgres in background
docker compose down        # stop (data persists in volume)
docker compose down -v     # stop AND delete data (fresh start)
docker compose logs -f     # stream Postgres logs
```

We only containerize Postgres, not the Spring app — because hot-reload
during development is faster running the JVM directly.

---

## 6. Entity & Repository Layer

### User.java — Key Concepts

```java
@Entity                     // Marks this as a JPA entity (maps to a DB table)
@Table(name = "users")      // Explicit table name (otherwise defaults to "user" which is a SQL reserved word)
@Getter @Setter             // Lombok generates all getters/setters
@NoArgsConstructor          // JPA requires a no-arg constructor
@AllArgsConstructor         // Needed for @Builder
@Builder                    // Enables User.builder().email("x").build() pattern
public class User implements UserDetails { ... }
```

**Why `implements UserDetails`?**

Spring Security needs to know about your user. `UserDetails` is its interface:
- `getUsername()` → we return `email`
- `getPassword()` → we return `passwordHash`
- `getAuthorities()` → roles/permissions (empty list for now)
- `isEnabled()`, `isAccountNonLocked()`, etc.

This lets Spring Security work with our User directly in the auth filter.

### UUID Primary Key

```java
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;
```

Why UUID instead of auto-increment integer:
- Safe to expose in URLs and JWTs (can't guess other user IDs)
- No sequential enumeration attacks
- Works across distributed systems

### Auditing with @PrePersist / @PreUpdate

```java
@PrePersist
protected void onCreate() {
    createdAt = Instant.now();
    updatedAt = Instant.now();
}
```

JPA lifecycle callbacks — automatically set timestamps when saving/updating.

### UserRepository.java

```java
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

**No implementation needed.** Spring Data generates the SQL from the method name:
- `findByEmail` → `SELECT * FROM users WHERE email = ?`
- `existsByEmail` → `SELECT COUNT(*) > 0 FROM users WHERE email = ?`

This is Spring Data's "derived query" feature.

---

## 7. DTOs with Java Records

```java
public record RegisterRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password,

    @NotBlank(message = "First name is required")
    String firstName,

    @NotBlank(message = "Last name is required")
    String lastName
) {}
```

### Why Java Records?

Records (Java 16+) are immutable data carriers. The compiler auto-generates:
- Constructor with all fields
- `equals()`, `hashCode()`, `toString()`
- Getter methods (e.g., `email()` not `getEmail()`)

Perfect for DTOs because they're just data containers — no behavior, no mutation.

### Validation Annotations

These come from `spring-boot-starter-validation` (Bean Validation / Hibernate Validator):
- `@NotBlank` — not null, not empty, not just whitespace
- `@Email` — valid email format
- `@Size(min = 8)` — minimum length

They only activate when the controller parameter has `@Valid`:

```java
public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request)
```

---

## 8. JWT Service

### How JWT Works

A JWT has 3 parts separated by dots: `header.payload.signature`

```
eyJhbGci...   ← Header (algorithm: HS384)
eyJzdWIi...   ← Payload (sub: userId, email, iat, exp)
nRAu5kiB...   ← Signature (HMAC of header+payload using our secret)
```

The server signs tokens with a secret key. On each request, it verifies
the signature to ensure the token hasn't been tampered with.

### Token Generation

```java
Jwts.builder()
    .subject(user.getId().toString())            // who this token is for
    .claim("email", user.getEmail())             // custom claim
    .issuedAt(new Date())                        // when issued
    .expiration(new Date(now + 15min))           // when it expires
    .signWith(getSigningKey())                   // sign with HMAC key
    .compact();                                  // build the string
```

### Token Validation

`Jwts.parser().verifyWith(key).build().parseSignedClaims(token)` does everything:
- Checks signature is valid (not tampered)
- Checks token is not expired
- Parses the payload claims

If anything fails, it throws an exception → `isTokenValid()` returns false.

---

## 9. Spring Security Config

### SecurityFilterChain

```java
http
    .cors(...)                              // allow cross-origin from React (localhost:5173)
    .csrf(csrf -> csrf.disable())           // disable CSRF — stateless API (see explanation below)
    .sessionManagement(session ->
        session.sessionCreationPolicy(STATELESS))  // no server-side sessions
    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/auth/**").permitAll()  // public endpoints
        .anyRequest().authenticated()                  // everything else needs a JWT
    )
    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
    .build();
```

### Why disable CSRF?

CSRF (Cross-Site Request Forgery) protection is for **session-based** auth where the browser
auto-sends cookies. A malicious site can trick the browser into making a request, and the
session cookie goes along automatically — that's the attack.

We disable CSRF because:
- **Access token** is in the `Authorization` header — the browser never auto-sends it.
  Your JS code explicitly attaches it, so a malicious site can't trigger it.
- **Refresh token** (coming later) will be in an HttpOnly cookie, BUT with `SameSite=Strict`.
  This means the browser only sends the cookie when the request originates from our own site.
  A request from `evil.com` won't include it.

So even with cookies, `SameSite=Strict` makes CSRF protection redundant for our setup.

### Why stateless sessions?

Default Spring Security creates a session (JSESSIONID cookie) after login. With JWT,
the token IS the session — no need for server-side state. Each request is self-contained.

### Password Encoder Bean

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

BCrypt is a one-way hash with a built-in salt. Every hash is different even for the same password:
- `password123` → `$2a$10$N9qo8uLOickgx2ZMRZoMye...`
- `password123` → `$2a$10$Xk7kC9kVqxMC4lE8RFB.2u...` (different salt)

`passwordEncoder.matches("password123", hash)` handles comparison.

---

## 10. Authentication Filter

### JwtAuthenticationFilter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter { ... }
```

**`OncePerRequestFilter`** ensures this runs exactly once per request
(not multiple times if the request is forwarded internally).

### Flow

```
Incoming Request
    │
    ├─ Has "Authorization: Bearer <token>" header?
    │   ├─ NO  → skip filter, continue (public endpoints handled by SecurityConfig)
    │   └─ YES → extract token
    │       ├─ Token valid?
    │       │   ├─ NO  → skip (will get 401 from SecurityConfig)
    │       │   └─ YES → load User from DB
    │       │       └─ Set SecurityContext (Spring now knows who's requesting)
    │
    └─ Continue filter chain
```

### SecurityContext

```java
SecurityContextHolder.getContext().setAuthentication(authToken);
```

This is how Spring Security tracks "who is the current user" for this request.
Controllers can then access the user via `@AuthenticationPrincipal` or
`SecurityContextHolder.getContext().getAuthentication().getPrincipal()`.

---

## 11. Service & Controller Layer

### AuthService.register()

```java
public AuthResponse register(RegisterRequest request) {
    // 1. Check duplicate
    if (userRepository.existsByEmail(request.email()))
        throw new EmailAlreadyExistsException(request.email());

    // 2. Build entity with hashed password
    User user = User.builder()
        .email(request.email())
        .passwordHash(passwordEncoder.encode(request.password()))
        .firstName(request.firstName())
        .lastName(request.lastName())
        .build();

    // 3. Save to DB
    userRepository.save(user);

    // 4. Generate token + return response
    return new AuthResponse(jwtService.generateAccessToken(user), user.getEmail(), user.getFirstName());
}
```

Why return a token on register? It's a UX choice — the user lands on the dashboard
immediately without having to login again. Most modern apps (GitHub, Vercel) do this.

### AuthController

```java
@RestController                      // All methods return JSON (not HTML views)
@RequestMapping("/api/auth")         // Base path for all endpoints in this controller
@RequiredArgsConstructor             // Lombok generates constructor for final fields (DI)
public class AuthController {

    private final AuthService authService;   // Injected by Spring (constructor injection)

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

### Key Annotations

- `@RestController` = `@Controller` + `@ResponseBody` (returns JSON, not a view)
- `@RequestMapping("/api/auth")` — prefix for all routes in this class
- `@PostMapping("/register")` — handles `POST /api/auth/register`
- `@Valid` — triggers Bean Validation on the request body
- `@RequestBody` — deserializes JSON → Java object (via Jackson)
- `@RequiredArgsConstructor` — Lombok generates constructor injection (preferred over `@Autowired`)

---

## 12. Global Exception Handling

### @RestControllerAdvice

```java
@RestControllerAdvice
public class GlobalExceptionHandler { ... }
```

This catches exceptions thrown by ANY controller and converts them to clean JSON responses.
Without it, Spring returns ugly HTML error pages or leaks stack traces.

### What it handles

| Exception | HTTP Status | When |
|---|---|---|
| `MethodArgumentNotValidException` | 400 | `@Valid` fails (bad email, short password, etc.) |
| `EmailAlreadyExistsException` | 409 | Duplicate registration |
| `Exception` (catch-all) | 500 | Anything unexpected (never leaks stack trace) |

### Validation Error Response Format

```json
{
  "status": 400,
  "error": "Validation failed",
  "fieldErrors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters",
    "firstName": "First name is required"
  }
}
```

Field-level errors make it easy for the React frontend to show errors next to each form field.

---

## Spring Boot Core Concepts Summary

| Concept | What it does |
|---|---|
| **@SpringBootApplication** | Enables auto-configuration, component scanning, and config |
| **@Component / @Service / @Repository** | Marks a class for Spring to manage (create, inject, etc.) |
| **@Autowired / constructor injection** | Spring automatically provides dependencies |
| **@Bean** | Manually defines an object for Spring to manage |
| **Spring Data JPA** | Auto-implements repository interfaces from method names |
| **Spring Security** | Filter chain that intercepts every request for auth/authz |
| **Embedded Tomcat** | Web server built into your jar — no separate install |
| **application.yml** | Central config file, read at startup |

---

## Common Gradle Commands

```bash
./gradlew bootRun        # Start the app
./gradlew compileJava    # Compile only (fast check for errors)
./gradlew build          # Compile + test + package into jar
./gradlew dependencies   # Show dependency tree
./gradlew clean          # Delete build/ directory
```
