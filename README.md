# Enterprise Productivity Admin Portal

Clean, enterprise-grade Web Admin Portal for Employee Productivity Enhancement System.

## Features
- **Offline Demo Mode**: Zero backend dependency by default. Uses realistic mock data.
- **Enterprise UI**: Clean layout, strict TypeScript, responsive design.
- **Pages**: Dashboard, Employees, Departments, Alerts, Policies.

## Tech Stack
- React 18 + TypeScript
- Vite
- Recharts (Charts)
- No external UI libraries (Custom CSS components)

## Quick Start (Offline Mode)

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Dev Server**
   ```bash
   npm run dev
   ```
   Access at `http://localhost:5173`.
   *Note: Runs on `0.0.0.0` for external access (e.g. from VM host).*

## Environment Variables
- `VITE_API_MODE`: `mock` (default) or `http`.
  - `mock`: Uses in-memory seed data with simulated latency.
  - `http`: Calls real backend endpoints.

## Backend Integration (Optional)
To run with the real Spring Boot backend:

1.  **Configure Database**
    Ensure PostgreSQL is running and credentials in `backend/src/main/resources/application.yml` are correct.

2.  **Start Backend**
    ```bash
    cd backend
    mvn clean install
    mvn spring-boot:run
    ```
    - API: `http://localhost:8080/api`
    - Health Check: `http://localhost:8080/api/health`

3.  **Enable Frontend Connection**
    Edit `frontend/.env`:
    ```env
    VITE_API_MODE=http
    ```
    Restart frontend (`npm run dev`).

## Project Structure
- `frontend/`: React + TypeScript Admin Portal
- `backend/`: Spring Boot REST API + Flyway Migrations

