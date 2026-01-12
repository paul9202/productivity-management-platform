# Productivity-X Management Platform

Production-grade management platform for "Productivity-X".

## Tech Stack
- **Backend**: Java Spring Boot 3.2, Java 17
- **Frontend**: React 18, Vite, Material UI
- **Database**: PostgreSQL 15
- **Migrations**: Flyway

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 17+
- Node.js 18+

### 0. Clone Repository
```bash
git clone https://github.com/paul9202/productivity-management-platform.git
cd productivity-management-platform
```

### 1. Start Infrastructure
```bash
docker-compose up -d
```
This starts PostgreSQL on port 5432.

### 2. Run Backend
```bash
cd backend
mvn spring-boot:run
```
Server starts on `http://localhost:8080`.
swagger-ui not enabled by default but API is accessible.

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the Admin UI at `http://localhost:5173`.

### 4. Update from Remote
If you need to pull the latest changes from the master/main branch:
```bash
# Ensure you are in the root directory (productivity-management-platform)
git pull origin main
```
*Note: If you see "fatal: not a git repository", ensure you ran `git clone` and are inside the correct folder (`cd productivity-management-platform`)*.

## Architecture
See `implementation_plan.md` for details.

### Security
- **mTLS**: In production, the Ingress/LB terminates TLS and forwards the client certificate.
- **Dev Mode**: The backend accepts `X-Device-Id` header to simulate authenticated devices.

### API Endpoints
- `POST /api/telemetry/focus/batch`: Ingest telemetry.
- `GET /api/policy/agent`: Fetch agent policy.
- `GET /api/reports/daily`: Fetch daily aggregates.
