# CommonMarketplace – Backend Service

**CommonMarketplace** is an e-commerce backend designed with a focus on **scalability, maintainability, and testability**, built using **Node.js, Express, and Onion Architecture**.

The system manages users, roles, stores, products, categories, and messaging in real time, integrating **specialized external services** to delegate critical responsibilities such as authentication and real-time communication.

This project was developed as a **frontend-independent** backend, geared toward real production environments and designed to be easily extensible.

## Key Technical Decisions

- **Onion architecture** to decouple domain, application logic, and infrastructure.
- **Supabase** for authentication and user management, avoiding sensitive logic within the system core.
- **Ably** for real-time messaging between users (chat).
- **MongoDB** as the main database.
- **Docker + Nginx** to facilitate deployment and simulate a production environment.
- **Testing** at the level of use cases, controllers, and services.

# Project Structure (Onion Architecture)

**CommonMarketplace** uses the principles of **Onion Architecture** to ensure clear separation of responsibilities, facilitate testing, and improve long-term maintainability.

The fundamental rule is that **all dependencies point toward the center**. The outer layers depend on the inner layers, but the core knows nothing about the layers surrounding it.

---

## `core` (Domain)

This is the heart of the application. It contains all the pure business logic and rules.

- **Typical content**: Business entities, repository interfaces, domain services.
- **Key rule**: It has **no dependencies** on any other layer of the project.
---

## `application` (Use Cases)

Orchestrates the logic of the `core` to execute specific actions that the application can perform. Defines what the software does.

- **Typical content**: Use cases (e.g., `createUser`, `getProductById`), DTOs (Data Transfer Objects).
- **Depends on**: `core`.

---

## `infrastructure`

Provides the technical implementations of the interfaces defined in the internal layers. It is the “how” things are connected.

- **Contents**: Database connection, repository implementations (for MongoDB), clients for external APIs.
- **Depends on**: `core` and `application`.

---

## `presentation`

This is the entry point to the application and the outermost layer. It handles interaction with the client (CommonMarketplace-CLIENT API).

- **Typical content**: Controllers, Routes, and middlewares.
- **Depends on**: `application`.

### Dependency Flow

The control flow and dependencies follow this direction:

`Presentation` → `Application` → `Core`

This means that a class in the `core` layer should **never** import or depend on anything in `application` or `infrastructure`.

### Docker Development

For development with Docker, use:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Rebuild after code changes
docker-compose up -d --build app
```

## initial Installation Guide

1. Clone and Configure

```bash
git clone https://github.com/CARLOSGRCIAGRCIA/commons-marketplace.git

cd commons-marketplace

npm install

cp .env.example .env
```

2. Configure Environment Variables

**Edit the .env file with your settings:**

1. **Supabase**: URL and API keys for your project
2. **MongoDB**: Connection string and database name (use service name `mongodb` in DB_URL)
3. **Server**: Port and environment (development/production)
4. **Swagger**: Base URL for documentation (optional)
5. **SSL Certificates**: Generate certificates for HTTPS (see Docker Compose Setup section)

# API Documentation

## Interactive Documentation

Our API is fully documented using Swagger/OpenAPI 3.0.

### Accessing the Documentation

**Development Environment:**

1. Ensure `NODE_ENV=development` in your `.env` file
2. Start services: `docker-compose up -d`
3. Access Swagger UI: `https://localhost:8444/api-docs`

**Production Environment:**

- Swagger is **automatically disabled** when `NODE_ENV=production`
- The `/api-docs` endpoint will return 404
- This is a security feature to prevent exposing API documentation in production

### Swagger Configuration

Swagger URL is configurable via environment variables:

- `SWAGGER_BASE_URL`: Primary URL for Swagger (optional)
- `BASE_URL`: Fallback URL if `SWAGGER_BASE_URL` is not set
- Default: `http://localhost` (for local development)

Example for development server:

```bash
SWAGGER_BASE_URL=https://dev-api.yourdomain.com
NODE_ENV=development
```

### Features Available in Swagger UI

- **Interactive Testing**: Execute API calls directly from the browser
- **Request/Response Schemas**: View detailed input/output structures
- **Authentication**: Test authenticated endpoints with JWT tokens
- **Validation**: See validation rules for each endpoint
- **Error Responses**: Understand all possible error scenarios

## Available Endpoints

### Authentication Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| `POST` | `/api/auth/register` | User registration | No            |
| `POST` | `/api/auth/login`    | User login        | No            |
| `POST` | `/api/auth/logout`   | User logout       | Yes           |

### User Management Endpoints

| Method   | Endpoint             | Description            | Auth Required |
| -------- | -------------------- | ---------------------- | ------------- |
| `GET`    | `/api/users/profile` | Get user profile       | Yes           |
| `PUT`    | `/api/users/:id`     | Update user profile    | Yes           |
| `DELETE` | `/api/users/:id`     | Delete user account    | Yes           |
| `GET`    | `/api/users`         | Get all users (Admin)  | Yes           |
| `GET`    | `/api/users/:id`     | Get user by ID (Admin) | Yes           |

## Authentication

### Getting Started with API Testing

1. **Register a new user** using `/api/auth/register`
2. **Login** to get your JWT token from `/api/auth/login`
3. **Authorize** in Swagger UI by clicking the "Authorize" button
4. **Paste your token** in the format: `Bearer your-jwt-token-here`
5. **Start testing** protected endpoints

### Token Format

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Documentation Not Loading?

- Ensure services are running: `docker-compose ps`
- Verify `NODE_ENV=development` (Swagger is disabled in production)
- Check backend logs: `docker-compose logs app`
- Access via HTTPS: `https://localhost:8444/api-docs` (not HTTP)
- Verify SSL certificate is properly configured

### Authentication Not Working?

- Make sure to copy the full token including "Bearer "
- Check token expiration
- Verify the user account is active

### Endpoints Missing?

- Refresh the Swagger UI page
- Check that JSDoc comments are properly formatted
- Verify the endpoint is registered in Express

---

## Docker Compose Setup

### Prerequisites

Make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) or [Podman](https://podman.io/getting-started/installation)
- Docker Compose or Podman Compose

---

### Environment Variables

Before running the services, create a `.env` file in the root of your project:

```bash
cp .env.example .env
```

Edit the `.env` file with your settings:

**Required variables:**

```bash
# Database Configuration
DB_USERNAME=admin
DB_PASSWORD=admin123
DB_PORT=27017
DB_NAME=CommonMarketplaceServiceDB
DB_URL=mongodb://admin:admin123@mongodb:27017/CommonMarketplaceServiceDB?authSource=admin

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_STORAGE_BUCKET=your-bucket-name

# Server Configuration
PORT=3000
NODE_ENV=development

# Swagger Configuration (optional)
SWAGGER_BASE_URL=http://localhost
BASE_URL=http://localhost

# Ably (optional, for chat functionality)
ABLY_API_KEY=your_ably_key
```

**Important Notes:**

- `DB_URL` must use `mongodb` as the hostname (service name in docker-compose), not `localhost`
- `NODE_ENV=production` automatically disables Swagger documentation
- `SWAGGER_BASE_URL` or `BASE_URL` can be set to your development server URL

---

### SSL Certificates Setup

The project uses SSL certificates for HTTPS. Generate self-signed certificates:

```bash
# Create certificates directory
mkdir -p nginx/certs

# Generate certificate (replace with your local IP)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/server.key \
  -out nginx/certs/server.crt \
  -subj "/C=MX/ST=Estado/L=Ciudad/O=CommonMarketplace/CN=YOUR_IP_ADDRESS"
```

**Note:** Certificates are in `.gitignore` and won't be committed to the repository.

---

### Using Docker Compose

**Start all services**

```bash
docker-compose up -d
# or with podman
podman-compose up -d
```

**This will start:**

- MongoDB database on port `27017`
- Backend API (internal, not exposed directly)
- Nginx with SSL on port `8444` (HTTPS)

**Access the API:**

- HTTPS: `https://localhost:8444`
- Health Check: `https://localhost:8444/health`
- API Docs (development only): `https://localhost:8444/api-docs`

**View logs**

```bash
# All services
docker-compose logs -f

# Single service
docker-compose logs -f app
docker-compose logs -f mongodb
docker-compose logs -f nginx
```

**Stop services**

```bash
docker-compose down
```

**Rebuild after code changes**

```bash
docker-compose up -d --build
```

**Stop and remove volumes (clean start)**

```bash
docker-compose down -v
```

---

### Docker Compose Services

The `docker-compose.yml` includes:

1. **mongodb**: MongoDB 8.0.8 with persistent volume
2. **app**: Node.js backend application
3. **nginx**: SSL termination and reverse proxy

**Networks:**

- `back-end`: Internal network for backend services
- `front-end`: Network for frontend communication

**Volumes:**

- `mongo-data`: Persistent storage for MongoDB data
