# ShareBite: Production-Structured Food Rescue & Surplus Redistribution Platform

> **Round 2 Hackathon MVP Implementation**  
> *A high-assurance, full-stack food rescue web application bridging commercial surplus food with verified NGOs, pantries, and community shelters.*

---

## 🚀 Mission & Key Highlights

ShareBite delivers a genuinely runnable, production-structured food rescue solution that eliminates food waste while ensuring verified safety, cryptographic handover integrity, and concurrency-safe reservations.

- **Zero Race Conditions:** Atomic MongoDB `findAndModify` conditional reservations prevent duplicate claims when multiple NGOs attempt to reserve the same listing simultaneously.
- **Deterministic Operational Logistics:** Algorithmic matching calculated via **Geographic Proximity (45% Haversine)**, **Capacity Alignment (30%)**, and **Pickup Window Urgency (25%)** with transparent mathematical explanations (no pseudo-AI/ML black boxes).
- **Cryptographic Single-Use QR Handovers:** Short-lived tokens hashed server-side with **SHA-256** and immediately consumed/invalidated upon physical collection and delivery.
- **Strict Food Safety Governance:** Disclaimers clarifying that the platform facilitates logistics without certifying food, coupled with mandatory storage declarations, preparation timestamps, allergen disclosures, and recipient acceptance inspection checklists.
- **1-Click Hackathon Evaluator Access:** Switch between all 4 roles (**Donor, NGO, Volunteer, Admin**) with a single click right from the navigation bar.

---

## 🏛 Architecture Diagram

```mermaid
flowchart TD
    subgraph Users["Platform Actors"]
        Donor["Commercial Donor\n(Caterer, Bakery)"]
        NGO["Verified NGO\n(Pantry, Soup Kitchen)"]
        Courier["Volunteer Courier\n(Logistics Fleet)"]
        Admin["System Administrator\n(Verification & Oversight)"]
    end

    subgraph Client["Frontend (React 18 + Vite + TypeScript)"]
        Landing["Interactive Radar Landing\n(Leaflet Map & Live Metrics)"]
        DonorDash["Donor Workspace\n(Create Listing, Issue QR)"]
        NgoDash["NGO Hub\n(Deterministic Matches, Reserve)"]
        VolDash["Courier Portal\n(Accept Run, Token Scanner)"]
        AdminDash["Admin Command Center\n(Org Verify, Audit Stream)"]
        SafetyModal["Food Safety Inspection Checklist"]
        QrModal["Single-Use SHA-256 QR Handover"]
    end

    subgraph Backend["Backend API (Java 21 + Spring Boot 3.3.4)"]
        Security["Spring Security + JWT + BCrypt"]
        Controllers["REST Controllers\n(/api/donations, /claims, /pickups)"]
        Services["Core Services\n(Matching, Claim, Pickup, Audit)"]
        Concurrency["Atomic Concurrency Engine\n(MongoTemplate.findAndModify)"]
        TokenAuth["Handover Token Vault\n(SHA-256 Single-Use Hasher)"]
    end

    subgraph Storage["Database (MongoDB 7.0)"]
        UsersCol[("users")]
        OrgsCol[("organisations")]
        DonationsCol[("donations\n(status: AVAILABLE | RESERVED | PICKED_UP | COMPLETED)")]
        ClaimsCol[("claims")]
        PickupsCol[("pickups")]
        AuditCol[("audit_events")]
        ReportsCol[("reports")]
    end

    Donor --> DonorDash
    NGO --> NgoDash
    Courier --> VolDash
    Admin --> AdminDash

    DonorDash -->|POST /api/donations| Controllers
    NgoDash -->|POST /api/claims (Atomic)| Concurrency
    VolDash -->|POST /api/pickups/verify| TokenAuth
    AdminDash -->|POST /api/admin/organisations/verify| Services

    Controllers --> Services
    Services --> Security
    Concurrency --> DonationsCol
    Services --> ClaimsCol
    TokenAuth --> PickupsCol
    Services --> AuditCol
    Services --> UsersCol
    Services --> OrgsCol
```

---

## 📦 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.3.4, Maven 3.9 | REST API, Business Logic, Security |
| **Database** | MongoDB 7.0, Spring Data MongoDB | Document store, Atomic operations, Geospatial coords |
| **Security** | Spring Security 6, JJWT 0.12.6, BCrypt | Role-Based Access Control, JWT Tokens, Password Hashing |
| **Frontend** | React 18, Vite 5, TypeScript 5, Tailwind CSS | High-performance SPA with Dark Navy/Teal/Emerald 3D styling |
| **Maps** | Leaflet 1.9, CartoDB Dark Matter | Interactive map visualization with custom SVG status pins |
| **QR / Handover** | `qrcode.react`, SHA-256 MessageDigest | Single-use physical handover cryptographic verification |
| **Testing** | JUnit 5, Mockito, Vitest | Backend concurrency, permission, and frontend logistics tests |

---

## 👥 Demo Personas & Pre-Configured Accounts

All accounts use the universal password: `Password123!`

| Role | Email | Organisation / Persona | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **DONOR** | `donor@sharebite.demo` | GreenBite Gourmet Catering | Create listings, declare storage/temp, issue QR tokens |
| **NGO** | `ngo@sharebite.demo` | Hope Community Food Pantry | View match scores, atomic reserve, accept safety terms |
| **VOLUNTEER** | `volunteer@sharebite.demo` | Alex Rivera (Courier Fleet) | Accept pickup run, validate donor token, deliver to shelter |
| **ADMIN** | `admin@sharebite.demo` | System Administrator | Verify pending NGOs, inspect audit logs, resolve reports |
| **NGO (Pending)** | `shelter@sharebite.demo` | Downtown Haven Shelter | Demonstrates unverified state (cannot claim until approved) |

---

## ⚡ Quick Start: Running on Windows

### Prerequisites
- **Java 21 or later** (`java -version`)
- **Node.js 18 or later** (`node -v`)
- **MongoDB 7.0** running locally on port `27017`

### 1. Start MongoDB (if not running as a Windows Service)
```powershell
# From the project root:
& "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "data\db" --bind_ip 127.0.0.1 --port 27017
```

### 2. Start the Backend API (Spring Boot)
```powershell
cd server
.\mvnw.cmd spring-boot:run
```
*The backend starts at `http://localhost:8080`. Seed data is loaded automatically on first boot.*

### 3. Start the Frontend (Vite)
Open a new terminal:
```powershell
cd client
npm install
npm run dev
```
*The frontend starts at `http://localhost:5173` with automatic API proxying to `http://localhost:8080`.*

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests (JUnit 5 + Mockito)
```powershell
cd server
.\mvnw.cmd test
```
**Test Coverage Highlights:**
- `DonationConcurrencyClaimTest`: Validates atomic `findAndModify` reservation; guarantees two concurrent claims result in exactly 1 success and 1 `409 Conflict`.
- `DonationStateTransitionTest`: Prohibits editing or canceling reserved/in-transit/completed donations.
- `MatchingServiceTest`: Verifies Haversine calculations and deterministic scoring formula output (0..100).
- `AuthControllerTest`: Tests BCrypt password verification, JWT generation, and duplicate registration protection.
- `SecurityPermissionTest`: Blocks unverified NGOs from reserving food; tests single-use SHA-256 token expiration.

### Frontend Unit Tests (Vitest)
```powershell
cd client
npm test
```
*Tests Haversine distance calculations and mathematical scoring behavior on the client.*

---

## 🔄 End-to-End Walkthrough Scenario

Test the complete lifecycle in under 3 minutes:

1. **Step 1: Donor Lists Surplus Food**
   - Click **Role Switcher** -> Select **Donor**.
   - Click **"New Food Listing"**.
   - Input: Title *"Fresh Bagels & Croissants"*, Category: `BAKERY`, Quantity: `30 portions`, Storage: `Ambient Dry`, Safe Handling Notes: *"Baked at 6:00 AM; contains wheat and butter."*
   - Click **"Publish Listing"**. The donation appears with status `AVAILABLE`.
2. **Step 2: NGO Discovers & Atomically Reserves Food**
   - Click **Role Switcher** -> Select **NGO**.
   - In **"Surplus Radar"**, view the newly created donation. Click **"Why this match?"** to see the 45% Proximity, 30% Capacity, 25% Urgency breakdown.
   - Click **"Reserve & Inspect Food"**.
   - The **Food Safety Modal** opens. Review donor disclosures, check packaging & temperature acknowledgement boxes, then click **"Confirm & Reserve Food"**.
   - Status changes atomically to `RESERVED`. No other NGO can claim this donation.
3. **Step 3: Volunteer Accepts Mission**
   - Click **Role Switcher** -> Select **Volunteer**.
   - In active missions, see the pickup task assigned for this claim.
4. **Step 4: Single-Use QR Handover from Donor**
   - Switch to **Donor** tab: Click **"Issue Handover QR Token"**. A QR code appears with a single-use token (e.g., `SB-DONOR_HANDOVER-A8F19B2C`).
   - Switch to **Volunteer** tab: Click **"Validate Donor Handover Token"**, input/paste the token.
   - Status transitions to `PICKED_UP` / `COLLECTED`. The token is cryptographically invalidated on the server.
5. **Step 5: Delivery & NGO Confirmation**
   - Switch to **NGO** tab: In **"My Active Claims"**, click **"Show Delivery QR Receipt"** (or click **"Confirm Receipt On-Site"**).
   - If using QR: Volunteer enters the delivery token to confirm.
   - Status transitions to `COMPLETED` / `FULFILLED`.
6. **Step 6: Impact & Audit Log Updates**
   - Switch to **Admin** tab: Observe the updated impact analytics (Total Meals Rescued +30, CO2e Avoided +33.7 kg) and view the complete audit trail in the **Audit Log** tab.

---

## 🔒 Security & Food Safety Principles

1. **Facilitation, Not Certification:** ShareBite explicitly disclaims certification of food quality, enforcing donor preparation declarations and on-site recipient inspection checklists.
2. **Deterministic Transparency:** Proximity and urgency scoring are strictly auditable; no ungrounded probabilistic ML claims.
3. **Data Protection:** Passwords are hashed using standard BCrypt with cost factor 10. Private user details are protected behind JWT authentication and role-based route guards.
4. **Single-Use Tokens:** Tokens are hashed with SHA-256 before database storage; tokens expire after 20 minutes and are wiped immediately upon verification.
5. **Incident Reporting:** Anyone can submit an incident report (`SAFETY_VIOLATION`, `SPOILED_FOOD`, `NO_SHOW`), routed directly to the Admin Desk for resolution.

---

## 🐳 Docker Deployment

To launch the complete isolated production-like stack:
```bash
docker compose up --build
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- MongoDB: `localhost:27017`
