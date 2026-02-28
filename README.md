# Spring + React JWT Auth Template

Minimal full-stack JWT authentication system with access/refresh token strategy.

## Tech Stack

- **Backend**: Spring Boot 3.5.2, Java 21, Gradle (Kotlin DSL)
- **Auth**: JWT (jjwt) with access + refresh token rotation
- **Database**: PostgreSQL 17
- **Frontend**: React 19, Vite 7, Tailwind CSS v4, shadcn/ui, React Router 7

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (for PostgreSQL)
- [Node.js](https://nodejs.org/) 20+ (for frontend)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- Java 21 *(auto-downloaded by Gradle if missing)*

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

### 3. Start the Frontend

```bash
cd client
pnpm install
pnpm dev
```

Frontend runs at **http://localhost:5173**

### 4. Test the API

Register a user:

```bash
curl -X POST http://localhost:8443/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","firstName":"John","lastName":"Doe"}'
```

Login:

```bash
curl -X POST http://localhost:8443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token, get new access token |
| POST | `/api/auth/logout` | Cookie | Revoke refresh token |

## Project Structure

```
spring-react-jwt-auth/
├── docker-compose.yml              # PostgreSQL container
├── server/                         # Spring Boot backend
│   ├── build.gradle.kts            # Dependencies & build config
│   ├── settings.gradle.kts         # Project name + Java toolchain
│   ├── gradlew                     # Gradle wrapper (Unix)
│   ├── INITIAL_SETUP.md            # Backend setup guide (learning resource)
│   └── src/main/
│       ├── resources/
│       │   └── application.yml     # Server config (port, DB, JWT)
│       └── java/com/springauth/
│           ├── AuthApplication.java
│           ├── config/             # Security & JWT filter
│           ├── controller/         # REST endpoints
│           ├── dto/                # Request/response records
│           ├── entity/             # JPA entities (User, RefreshToken)
│           ├── exception/          # Error handling
│           ├── repository/         # Data access
│           └── service/            # Business logic (Auth, JWT, Token)
├── client/                         # React frontend
│   ├── package.json
│   ├── vite.config.ts              # Vite + Tailwind + path aliases
│   ├── components.json             # shadcn/ui config
│   ├── INITIAL_SETUP.md            # Frontend setup guide (learning resource)
│   └── src/
│       ├── index.css               # Tailwind + shadcn theme
│       ├── App.tsx                 # Routes
│       ├── components/ui/          # shadcn components
│       ├── lib/utils.ts            # shadcn utility
│       └── pages/                  # Login, Register, Dashboard, etc.
```

## Stopping

```bash
# Stop the Spring Boot server
Ctrl+C

# Stop the React dev server
Ctrl+C

# Stop PostgreSQL
docker compose down

# Stop PostgreSQL AND delete all data
docker compose down -v
```

## Learning Resources

- [`server/INITIAL_SETUP.md`](server/INITIAL_SETUP.md) — Backend from-scratch guide (Spring Boot, JPA, Security, JWT)
- [`client/INITIAL_SETUP.md`](client/INITIAL_SETUP.md) — Frontend from-scratch guide (Vite, Tailwind, shadcn, React Router)
