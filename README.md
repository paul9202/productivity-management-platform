
# Enterprise Productivity Admin Portal

## M3: Automated Onboarding Delivery Report

## 1. File Changes
### Backend (Spring Boot)
- **Schema**: `src/main/resources/db/migration/V6__enrollment_and_certs.sql` (New Tables: `enrollment_tokens`, `device_certificates`; Alter `devices`).
- **Models**:
    - `src/main/java/com/productivityx/model/EnrollmentToken.java` (New)
    - `src/main/java/com/productivityx/model/DeviceCertificate.java` (New)
    - `src/main/java/com/productivityx/model/Device.java` (Updated fields: fingerprint, cert, status)
- **Repositories**:
    - `src/main/java/com/productivityx/repository/EnrollmentTokenRepository.java` (New)
    - `src/main/java/com/productivityx/repository/DeviceCertificateRepository.java` (New)
    - `src/main/java/com/productivityx/repository/DeviceRepository.java` (Updated: `findByFingerprintHash`)
- **Controllers**:
    - `src/main/java/com/productivityx/controller/EnrollmentTokenController.java` (New: `/api/enrollment-tokens` for Management)
    - `src/main/java/com/productivityx/controller/EnrollmentController.java` (New: `/api/enroll` for Device Registration)
    - `src/main/java/com/productivityx/controller/DeviceController.java` (Updated: `/heartbeat`, `/rotate-cert`)
    - `src/main/java/com/productivityx/controller/PolicyController.java` (Updated: `/effective`)

### Frontend (React)
- **Types**: `src/types/index.ts` (Added `EnrollmentToken`).
- **API**: `src/api/index.tsx` (Added Enrollment methods to `ApiClient`, Mock, and Http implementations).
- **Pages**: `src/pages/Enrollment.tsx` (New: Token Management UI).
- **Routing**: `src/App.tsx` (Added `/admin/enrollment` route).

## 2. API Documentation

### Enrollment (Device Side)
- **POST `/api/enroll`**
    - **Description**: Registers a new device using a Bootstrap Token or Registration Code.
    - **Input**: `{ "token": "...", "fingerprintHash": "...", "hostname": "...", "agentVersion": "..." }`
    - **Output**: `{ "deviceId": "...", "pfxBase64": "...", "certThumbprint": "...", "tenantId": "..." }`
    - **Logic**: Validates token (hash/expiry/uses), registers/updates device, issues Mock PFX.

### Device Lifecycle
- **POST `/api/devices/{id}/heartbeat`**
    - **Description**: Updates device status and last seen timestamp.
    - **Input**: `{ "status": "ONLINE", "agentVersion": "..." }`
    - **Action**: Updates `lastSeenAt` and `status`.
- **POST `/api/devices/{id}/rotate-cert`**
    - **Description**: Request a new certificate (Mock rotation).
    - **Result**: Initiates rotation.

### Policy Management
- **GET `/api/policies/effective?deviceId=...`**
    - **Description**: Returns the effective policy configuration for a specific device.
    - **Output**: JSON Configuration object (blocking rules, thresholds).

### Enrollment Token Management (Admin Portal)
- **GET `/api/enrollment-tokens`**: List all tokens.
- **POST `/api/enrollment-tokens`**: Create a new token (Bootstrap or RegCode).
    - **Input**: `{ "type": "BOOTSTRAP", "maxUses": 100, "expiresInDays": 30, "scopeGroupId": "..." }`
- **DELETE `/api/enrollment-tokens/{id}`**: Revoke a token.

## 3. Enrollment State Machine

`NEW` (Unregistered) -> `ENROLLING` (Contacting API) -> `ENROLLED` (DB Record Created) -> `CERT_ISSUED` (PFX Received) -> `ONLINE` (Heartbeat Active)

FAILED States:
- `REVOKED`: Admin revoked device or cert.
- `EXPIRED`: Cert expired.

## 4. Local Run Steps

### Requirements
- Java 17+, Maven
- Node.js 18+
- Docker (for PostgreSQL)

### Steps
1.  **Start DB**: `docker-compose up -d`
2.  **Start Backend**: `mvn clean spring-boot:run` (Migrations run automatically).
3.  **Start Frontend**: `npm run dev` (Access at `http://localhost:5173`).
4.  **Login**: Use `admin` / `password`.

### Verification Scenarios
**Scenario A: Zero-Touch Mock (Bootstrap)**
1.  Go to `http://localhost:5173/admin/enrollment`.
2.  Create a "BOOTSTRAP" token.
3.  (Simulate Client): POST to `/api/enroll` with that token.
4.  Check `Devices` list to see new device.

**Scenario B: Manual Registration (Code)**
1.  Create "REGCODE" token (e.g. `REG-123`).
2.  Use Client/Postman to POST `/api/enroll` with `token: "REG-123"`.
3.  Verify Token usage count increases to 1 in Portal.

### Frontend (React)
- **Types**: `src/types/index.ts` (Added `EnrollmentToken`).
- **API**: `src/api/index.tsx` (Added Enrollment methods to `ApiClient`, Mock, and Http implementations).
- **Pages**: `src/pages/Enrollment.tsx` (New: Token Management UI).
- **Routing**: `src/App.tsx` (Added `/admin/enrollment` route).

## 2. API Documentation

### Enrollment (Device Side)
- **POST `/api/enroll`**
    - **Description**: Registers a new device using a Bootstrap Token or Registration Code.
    - **Input**: `{ "token": "...", "fingerprintHash": "...", "hostname": "...", "agentVersion": "..." }`
    - **Output**: `{ "deviceId": "...", "pfxBase64": "...", "certThumbprint": "...", "tenantId": "..." }`
    - **Logic**: Validates token (hash/expiry/uses), registers/updates device, issues Mock PFX.

### Device Lifecycle
- **POST `/api/devices/{id}/heartbeat`**
    - **Description**: Updates device status and last seen timestamp.
    - **Input**: `{ "status": "ONLINE", "agentVersion": "..." }`
    - **Action**: Updates `lastSeenAt` and `status`.
- **POST `/api/devices/{id}/rotate-cert`**
    - **Description**: Request a new certificate (Mock rotation).
    - **Result**: Initiates rotation.

### Policy Management
- **GET `/api/policies/effective?deviceId=...`**
    - **Description**: Returns the effective policy configuration for a specific device.
    - **Output**: JSON Configuration object (blocking rules, thresholds).

### Enrollment Token Management (Admin Portal)
- **GET `/api/enrollment-tokens`**: List all tokens.
- **POST `/api/enrollment-tokens`**: Create a new token (Bootstrap or RegCode).
    - **Input**: `{ "type": "BOOTSTRAP", "maxUses": 100, "expiresInDays": 30, "scopeGroupId": "..." }`
- **DELETE `/api/enrollment-tokens/{id}`**: Revoke a token.

## 3. Enrollment State Machine

`NEW` (Unregistered) -> `ENROLLING` (Contacting API) -> `ENROLLED` (DB Record Created) -> `CERT_ISSUED` (PFX Received) -> `ONLINE` (Heartbeat Active)

FAILED States:
- `REVOKED`: Admin revoked device or cert.
- `EXPIRED`: Cert expired.

## 4. Local Run Steps

### Requirements
- Java 17+, Maven
- Node.js 18+
- Docker (for PostgreSQL)

### Steps
1.  **Start DB**: `docker-compose up -d`
2.  **Start Backend**: `mvn clean spring-boot:run` (Migrations run automatically).
3.  **Start Frontend**: `npm run dev` (Access at `http://localhost:5173`).
4.  **Login**: Use `admin` / `password`.

### Verification Scenarios
**Scenario A: Zero-Touch Mock (Bootstrap)**
1.  Go to `http://localhost:5173/admin/enrollment`.
2.  Create a "BOOTSTRAP" token.
3.  (Simulate Client): POST to `/api/enroll` with that token.
4.  Check `Devices` list to see new device.

**Scenario B: Manual Registration (Code)**
1.  Create "REGCODE" token (e.g. `REG-123`).
2.  Use Client/Postman to POST `/api/enroll` with `token: "REG-123"`.
3.  Verify Token usage count increases to 1 in Portal.

