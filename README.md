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

## Future Integration
To switch to real backend:
1. Update `src/api/index.tsx` to implement `HttpApiClient` methods using fetch/axios.
2. Set `VITE_API_MODE=http` in `.env`.
3. Ensure Backend is running on port 8080.

## Project Structure
- `src/api`: ApiClient interface and Mock implementation.
- `src/components`: Reusable UI (Layout, KpiCard).
- `src/mock`: Seed data generation.
- `src/pages`: Feature pages.
- `src/types`: Domain interfaces (Employee, Department, etc.).
