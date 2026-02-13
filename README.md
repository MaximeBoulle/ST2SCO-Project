# Chatty - Real-Time Chat Application

A real-time chat web application built for educational purposes as part of the **ST2SCO - Secure Coding** course at **EFREI Paris** (I3 Software Engineer, 2025-2026).

The project demonstrates common web application security vulnerabilities and their mitigations. It ships with two branches: a **secure version** (`master`) and a **vulnerable version** (`vulnerabilites`) containing five intentionally introduced security flaws for analysis and learning.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Run with Docker](#run-with-docker)
  - [Run Locally (without Docker)](#run-locally-without-docker)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Demo Credentials](#demo-credentials)
- [Branch Strategy](#branch-strategy)
- [Implemented Vulnerabilities](#implemented-vulnerabilities-vulnerabilites-branch)
- [Security Tooling (CI)](#security-tooling-ci)
- [Project Structure](#project-structure)
- [Authors](#authors)

---

## Tech Stack

| Layer              | Technology                                      |
|--------------------|------------------------------------------------|
| **Backend**        | NestJS 11 (TypeScript), TypeORM 0.3, Passport.js + JWT |
| **Frontend**       | React 19 (Vite 7), Tailwind CSS 4, Socket.IO Client |
| **Database**       | PostgreSQL 16                                   |
| **Real-time**      | Socket.IO 4.8                                   |
| **Containerization** | Docker + Docker Compose                       |
| **CI/CD**          | GitHub Actions                                  |
| **Infrastructure** | Kubernetes manifests (k8s/)                     |

---

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js 20+](https://nodejs.org/) (only for local development without Docker)
- [Git](https://git-scm.com/)

---

## Getting Started

### Run with Docker

```bash
# Clone the repository
git clone <repo-url>
cd ST2SCO-Project

# Copy the environment file
cp .env.example .env

# Start all services (database, backend, frontend)
docker-compose up --build
```

Once the containers are running, the application is available at:

| Service          | URL                             |
|------------------|---------------------------------|
| Frontend         | http://localhost:5173            |
| Backend API      | http://localhost:3000/api        |
| Swagger Docs     | http://localhost:3000/api        |
| WebSocket        | ws://localhost:3000/api/socket.io |

To stop the application:

```bash
docker-compose down
```

To stop and remove all data (including the database volume):

```bash
docker-compose down -v
```

### Run Locally (without Docker)

Make sure PostgreSQL 16 is running locally, then configure the connection in your `.env` file.

**Backend:**

```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## Running Tests

```bash
# Backend unit tests
cd backend
npm install
npm run test

# Backend tests with coverage report
npm run test:cov

# Backend end-to-end tests
npm run test:e2e
```

---

## API Documentation

Interactive Swagger UI documentation is available at **http://localhost:3000/api** when the backend is running.

### Main Endpoints

| Method   | Endpoint              | Description                          | Auth Required | Role     |
|----------|-----------------------|--------------------------------------|---------------|----------|
| `POST`   | `/api/auth/register`  | Register a new user                  | No            | -        |
| `POST`   | `/api/auth/login`     | Login (sets JWT cookie)              | No            | -        |
| `POST`   | `/api/auth/logout`    | Logout (clears cookie)               | No            | -        |
| `GET`    | `/api/auth/profile`   | Get current user profile             | Yes           | Any      |
| `GET`    | `/api/messages`       | List messages (supports `?search=`)  | No            | -        |
| `POST`   | `/api/messages`       | Send a message                       | Yes           | Any      |
| `DELETE` | `/api/messages/:id`   | Delete a message                     | Yes           | Admin    |
| `GET`    | `/api/users`          | List all users                       | Yes           | Admin    |
| `POST`   | `/api/users`          | Create a user                        | Yes           | Admin    |
| `PATCH`  | `/api/users/:id`      | Update user profile                  | Yes           | Own/Admin |
| `PATCH`  | `/api/users/:id/ban`  | Ban or unban a user                  | Yes           | Admin    |
| `GET`    | `/api/users/:id/stats`| Get user statistics (vulnerable branch only) | Yes   | Admin    |

### WebSocket Events

| Event           | Direction       | Description                  |
|-----------------|-----------------|------------------------------|
| `message:new`   | Server -> Client | Emitted when a new message is sent |

---

## Demo Credentials

Two demo accounts are automatically created on first startup:

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | `admin`  | `Admin123!` |
| User  | `user`   | `User123!`  |

These accounts are seeded by `backend/src/seed/seed.service.ts` via the `OnApplicationBootstrap` hook. If the accounts already exist, the seed is skipped.

---

## Branch Strategy

| Branch          | Description                                              |
|-----------------|----------------------------------------------------------|
| `master`        | Secure version with all vulnerabilities fixed            |
| `vulnerabilites`| Contains 5 intentional security vulnerabilities for study |

Switch between branches to compare the secure and vulnerable implementations:

```bash
# View the vulnerable version
git checkout vulnerabilites

# View the secure version
git checkout master
```

---

## Implemented Vulnerabilities (vulnerabilites branch)

| #  | Vulnerability                              | Difficulty | CWE      | Location                              |
|----|--------------------------------------------|------------|----------|---------------------------------------|
| 1  | User Enumeration                           | Easy       | CWE-203  | `backend/src/auth/auth.controller.ts` |
| 2  | SQL Injection (1st Order)                  | Easy       | CWE-89   | `backend/src/messages/messages.service.ts` |
| 3  | Stored XSS                                 | Medium     | CWE-79   | `frontend/src/ChatPage.jsx`           |
| 4  | CSRF (CORS Misconfiguration + Insecure Cookies) | Medium | CWE-352  | `backend/src/main.ts`, `backend/src/auth/auth.controller.ts` |
| 5  | SQL Injection (2nd Order)                  | Hard       | CWE-89   | `backend/src/users/users.service.ts`  |

### Vulnerability Details

**1. User Enumeration (CWE-203)** -- The login and registration endpoints return different error messages depending on whether a username exists, allowing attackers to enumerate valid accounts.

**2. SQL Injection - 1st Order (CWE-89)** -- The message search endpoint (`GET /api/messages?search=`) interpolates user input directly into a raw SQL query without parameterization.

**3. Stored XSS (CWE-79)** -- Message content is rendered using `dangerouslySetInnerHTML` (or equivalent) in the chat interface, allowing stored script injection through crafted messages.

**4. CSRF via CORS Misconfiguration (CWE-352)** -- The backend accepts requests from any origin (`origin: true`) and the authentication cookie uses permissive settings, enabling cross-site request forgery attacks.

**5. SQL Injection - 2nd Order (CWE-89)** -- A malicious SQL payload stored as a username during registration is later executed when an admin views user statistics through a raw SQL query that interpolates the stored username.

---

## Security Tooling (CI)

The project includes five security scanning workflows in `.github/workflows/`:

| Tool       | Type               | Workflow File                               | Description                          |
|------------|--------------------|---------------------------------------------|--------------------------------------|
| Semgrep    | SAST               | `.github/workflows/sast-semgrep.yml`        | Static application security testing  |
| Snyk       | SCA                | `.github/workflows/sca-snyk.yml`            | Software composition analysis        |
| Gitleaks   | Secret Scanning    | `.github/workflows/secret-scan-gitleaks.yml`| Detect hardcoded secrets in code     |
| OWASP ZAP  | DAST               | `.github/workflows/dast-zap.yml`            | Dynamic application security testing |
| Checkov    | IaC Scanning       | `.github/workflows/iac-checkov.yml`         | Infrastructure-as-code scanning      |

Additionally, a full **CI/CD pipeline** (`.github/workflows/ci-cd-pipeline.yml`) handles:
- Backend and frontend build and lint
- Unit tests with coverage reporting
- Docker image build, push, and signing (via cosign) to GHCR

---

## Project Structure

```
ST2SCO-Project/
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── auth/               # Authentication (JWT, guards, strategies)
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── csrf.guard.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── roles.guard.ts
│   │   ├── seed/               # Database seeding (demo accounts)
│   │   │   ├── seed.module.ts
│   │   │   └── seed.service.ts
│   │   ├── users/              # User management (CRUD, roles, ban)
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   └── user.entity.ts
│   │   ├── messages/           # Real-time messaging (REST + WebSocket)
│   │   │   ├── messages.controller.ts
│   │   │   ├── messages.service.ts
│   │   │   ├── messages.module.ts
│   │   │   ├── messages.gateway.ts
│   │   │   └── message.entity.ts
│   │   ├── app.module.ts
│   │   └── main.ts            # App bootstrap (CORS, Swagger, cookie-parser)
│   ├── test/                   # E2E tests
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # React SPA (Vite)
│   ├── src/
│   │   ├── App.jsx             # Router setup
│   │   ├── LoginPage.jsx       # Authentication UI
│   │   ├── ChatPage.jsx        # Main chat interface
│   │   ├── AuthContext.jsx     # Auth state management
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind CSS styles
│   ├── Dockerfile
│   └── package.json
├── k8s/                        # Kubernetes deployment manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── db.yaml
│   ├── backend.yaml
│   ├── frontend.yaml
│   └── ingress.yaml
├── .github/workflows/          # CI/CD and security scanning
│   ├── ci-cd-pipeline.yml
│   ├── sast-semgrep.yml
│   ├── sca-snyk.yml
│   ├── secret-scan-gitleaks.yml
│   ├── dast-zap.yml
│   └── iac-checkov.yml
├── report/                     # Technical security report
├── docker-compose.yaml         # Full stack orchestration
├── .env.example                # Environment variable template
└── README.md
```

---

## Environment Variables

All configuration is managed through environment variables. Copy `.env.example` to `.env` and adjust as needed:

| Variable            | Default Value                              | Description                    |
|---------------------|--------------------------------------------|--------------------------------|
| `POSTGRES_DB`       | `st2sco`                                   | PostgreSQL database name       |
| `POSTGRES_USER`     | `st2sco_user`                              | PostgreSQL username            |
| `POSTGRES_PASSWORD` | `st2sco_password`                          | PostgreSQL password            |
| `NODE_ENV`          | `development`                              | Node.js environment            |
| `JWT_SECRET`        | `your-secret-key-change-in-production`     | Secret key for JWT signing     |
| `FRONTEND_URL`      | `http://localhost:5173`                     | Allowed CORS origin            |
| `WS_PATH`           | `/api/socket.io`                           | WebSocket endpoint path        |
| `DATABASE_HOST`     | `db`                                       | Database host (Docker service) |
| `DATABASE_PORT`     | `5432`                                     | Database port                  |
| `DATABASE_USER`     | `st2sco_user`                              | Database connection user       |
| `DATABASE_PASSWORD` | `st2sco_password`                          | Database connection password   |
| `DATABASE_NAME`     | `st2sco`                                   | Database connection name       |
| `PORT`              | `3000`                                     | Backend server port            |
| `VITE_API_URL`      | `http://localhost:3000/api`                 | Frontend API base URL          |
| `VITE_WS_PATH`      | `/api/socket.io`                           | Frontend WebSocket path        |

---

## Authors

EFREI Paris -- I3 Software Engineering -- Secure Coding Project (ST2SCO), 2025-2026.
