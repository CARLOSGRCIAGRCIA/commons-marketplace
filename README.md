# Commons Marketplace — Backend API

Production-grade e-commerce backend built with **Node.js, Express and Onion Architecture**. Manages users, stores, products, categories, reviews and real-time messaging — deployed with Docker, Nginx and a Blue/Green CI/CD pipeline for zero-downtime releases.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Jest](https://img.shields.io/badge/Tests-736_passed-C21325?style=flat-square&logo=jest&logoColor=white)]()
[![Coverage](https://img.shields.io/badge/Coverage-79%25-brightgreen?style=flat-square)]()
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=flat-square)]()

---

## What makes this interesting

This started as a straightforward REST API and became an exercise in making a backend that's actually maintainable at scale. Three decisions shaped the architecture:

**1. Onion Architecture** — so the domain layer has zero knowledge of MongoDB, Supabase, or any external dependency. This made testing use cases without a real database trivial, and swapping infrastructure components painless.

**2. 736 tests across 78 suites** — written before most features were complete. Use cases at 100%, controllers at ~90%, validators at 100%. The coverage discipline forced cleaner interfaces between layers.

**3. Blue/Green deployment** — two identical production environments. Releases switch traffic between them, so a bad deploy is a one-command rollback with no downtime.

---

## Architecture

### Onion layers

```mermaid
mindmap
  root((Architecture))
    Presentation
      Controllers
      Routes
      Middlewares
    Application
      Use Cases
      DTOs
    Core
      Entities
      Repository Interfaces
      Domain Services
      _no external deps_
    Infrastructure
      MongoDB
      Supabase
      Ably
      DI Container
```

**The rule:** dependencies only point inward. `core` knows nothing about MongoDB, Express, or any framework. This is what makes unit testing use cases fast and reliable — no database setup needed, just mock the repository interface.

### Dependency flow

```mermaid
flowchart LR
    P[Presentation] --> A[Application]
    A --> C[Core]
    I[Infrastructure] --> C
    P --> I
```

### Request lifecycle

```mermaid
flowchart TD
    REQ([HTTP Request]) --> MW[Middleware chain\nauth · role · validation]
    MW -->|invalid| ERR([Custom exception → error response])
    MW -->|valid| CTRL[Controller]
    CTRL --> UC[Use Case]
    UC --> REPO[Repository interface]
    REPO --> IMPL[Infrastructure impl\nMongoDB · Supabase]
    UC -->|side effects| EXT[External services\nAbly · Storage]
    IMPL --> RES([Response DTO])
```

---

## Key design decisions

### Why Onion Architecture over MVC?

MVC works fine for small APIs. At ~50 endpoints with role-based auth, ownership checks, and multiple external services, a flat MVC structure mixes concerns in ways that make testing painful. Onion makes the business logic layer independently testable — no Express, no MongoDB, no Supabase required in unit tests.

### Why Supabase for auth?

JWT signing, token rotation, and session management are security-critical and easy to get wrong. Delegating that to Supabase means not writing or maintaining that code. The tradeoff is an external dependency — acceptable given the reliability guarantees.

### Why Ably for real-time?

Managing persistent WebSocket connections at scale is a solved problem. Ably handles reconnection, presence, and delivery guarantees. The API surface is small and the integration stays in the infrastructure layer, so it's swappable.

### Why Jest with mocks instead of integration tests?

Integration tests against a real MongoDB instance are slow and flaky in CI. By mocking repository interfaces, use case tests run in milliseconds and fail deterministically. Integration tests exist but are intentionally minimal.

---

## Test coverage

```
Test Suites:  78 passed, 78 total
Tests:       736 passed, 736 total
Statements:  ~79%
Branches:    ~69%
```

| Layer       | Coverage | Notes                             |
| ----------- | -------- | --------------------------------- |
| Use Cases   | 100%     | Core business logic, fully mocked |
| Validators  | 100%     | All input paths covered           |
| Controllers | ~90%     | HTTP handling layer               |
| Services    | ~80%     | Domain logic                      |

---

## Stack

| Layer        | Technology              |
| ------------ | ----------------------- |
| Runtime      | Node.js 18+             |
| Framework    | Express.js 5.x          |
| Language     | JavaScript (ES Modules) |
| Architecture | Onion / DDD             |
| Database     | MongoDB + Mongoose      |
| Auth         | Supabase (JWT)          |
| Real-time    | Ably (WebSocket)        |
| File storage | Supabase Storage        |
| Testing      | Jest 29                 |
| Logging      | Winston (structured)    |
| Docs         | Swagger / OpenAPI 3.0   |
| Containers   | Docker + Nginx (SSL)    |
| Deployment   | Blue/Green CI/CD        |

---

## Project structure

```
src/
├── core/                   # Domain — no external dependencies
│   ├── entities/           # Domain models
│   ├── repositories/       # Repository interfaces
│   └── services/           # Domain services
├── application/            # Use cases + DTOs
│   ├── use-cases/
│   └── dtos/
├── infrastructure/         # Implementations
│   ├── supabase/           # Auth + storage client
│   ├── ably/               # Real-time client
│   ├── di/                 # Dependency injection
│   └── logger/             # Winston config
├── presentation/           # HTTP layer
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/        # Auth · role · ownership
│   ├── validators/
│   └── exceptions/         # Custom error hierarchy
└── app.js
```

---

## API surface

50+ documented endpoints across 7 domains. Full interactive docs available at `/api-docs` in development.

| Domain     | Endpoints                                                |
| ---------- | -------------------------------------------------------- |
| Auth       | Register · Login · Logout                                |
| Users      | Profile · CRUD · Avatar upload                           |
| Stores     | CRUD · Approval workflow (pending / approved / rejected) |
| Products   | CRUD · Inventory · Image upload                          |
| Categories | Hierarchical (parent / child)                            |
| Reviews    | Ratings + comments                                       |
| Chat       | Conversations · Messages · Real-time via Ably            |

---

## Getting started

### Requirements

- Node.js 18+
- Docker + Docker Compose
- [Supabase](https://supabase.com) project (free tier)
- [Ably](https://ably.com) account (free tier)

### Local development

```bash
git clone https://github.com/CARLOSGRCIAGRCIA/commons-marketplace.git
cd commons-marketplace
npm install
cp .env.example .env   # fill in your credentials
docker-compose up -d   # starts MongoDB
npm run dev
```

API docs: `https://localhost:8443/api-docs`

### Environment variables

```env
# MongoDB
DB_URL=mongodb://admin:admin123@mongodb:27017/CommonMarketplaceServiceDB?authSource=admin

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=CommonMarketplace

# Ably
ABLY_API_KEY=your_ably_key

# Server
PORT=3000
NODE_ENV=development
```

### Scripts

```bash
npm run dev       # development with hot-reload
npm test          # run test suite
npm run coverage  # coverage report
npm run lint      # check code style
npm run lint:fix  # auto-fix
```

---

## License

ISC — see [LICENSE](LICENSE) for details.

---

Built by [Carlos Garcia](https://github.com/CARLOSGRCIAGRCIA)
