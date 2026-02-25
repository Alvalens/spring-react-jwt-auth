# Spring + React JWT Auth Template

Minimal full-stack JWT authentication system with access/refresh token strategy.

## Tech Stack

- **Backend**: Spring Boot 3.5.2, Java 21, Gradle (Kotlin DSL)
- **Auth**: JWT (jjwt) with access + refresh token rotation
- **Database**: PostgreSQL 17
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui *(planned)*

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (for PostgreSQL)
- Java 21 *(auto-downloaded by Gradle if missing)*

That's it. No global Gradle or Node install required.

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts a Postgres container with:
- **Database**: `auth_db`
- **User**: `auth_user`
- **Password**: `auth_pass`
- **Port**: `5432`

### 2. Start the Backend

```bash
cd server
./gradlew bootRun
```

First run downloads dependencies + Java 21 (if needed) — takes ~90 seconds.
Subsequent starts take ~8 seconds.

Server runs at **http://localhost:8443**

### 3. Test It

Register a user:

```bash
curl -X POST http://localhost:8443/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","firstName":"John","lastName":"Doe"}'
```

Expected response (201):

```json
{
  "accessToken": "eyJhbG...",
  "email": "test@test.com",
  "firstName": "John"
}
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |

*More endpoints (login, refresh, logout, password reset) coming soon.*

## Project Structure

```
spring-react-jwt-auth/
├── docker-compose.yml          # PostgreSQL container
├── server/                     # Spring Boot backend
│   ├── build.gradle.kts        # Dependencies & build config
│   ├── settings.gradle.kts     # Project name + Java toolchain
│   ├── gradlew                 # Gradle wrapper (Unix)
│   ├── INITIAL_SETUP.md        # From-scratch setup guide (learning resource)
│   └── src/main/
│       ├── resources/
│       │   └── application.yml         # Server config
│       └── java/com/springauth/
│           ├── AuthApplication.java    # Entry point
│           ├── config/                 # Security & JWT filter
│           ├── controller/             # REST endpoints
│           ├── dto/                    # Request/response records
│           ├── entity/                 # JPA entities
│           ├── exception/              # Error handling
│           ├── repository/             # Data access
│           └── service/                # Business logic
└── client/                     # React frontend (planned)
```

## Stopping

```bash
# Stop the Spring Boot server
Ctrl+C

# Stop PostgreSQL
docker compose down

# Stop PostgreSQL AND delete all data
docker compose down -v
```

## Learning Resources

See [`server/INITIAL_SETUP.md`](server/INITIAL_SETUP.md) for a detailed walkthrough of how this project was built from scratch, with explanations of every Spring Boot concept used.
