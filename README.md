# 🛡️ Guardia-AI — Enterprise Fraud Detection & Explainable Security

> A production-ready, AI-native banking security platform with real-time fraud detection, Gemini-powered explainability, and a professional Security Operations Center (SOC) dashboard.

---

## 🏗️ Architecture Overview

```
┌─────────────────────┐     REST/JWT     ┌──────────────────────────┐
│   React 18 + Vite   │ ◄──────────────► │  Spring Boot 3.x (Java)  │
│   Tailwind CSS SOC  │                  │  ├── FraudDetectionSvc    │
│   Recharts / Lucide │                  │  ├── AiExplanationSvc     │
└─────────────────────┘                  │  ├── BreachIntelligenceSvc│
                                         │  └── FirebaseEventSvc     │
                                         └────────┬─────────────┬────┘
                                                  │             │
                                            ┌─────▼─────┐  ┌───▼──────────┐
                                            │    H2     │  │   Firebase   │
                                            │ (Dev) /   │  │ Realtime DB  │
                                            │PostgreSQL │  │  (optional)  │
                                            │  (Prod)   │  └──────────────┘
                                            └───────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Java 21+
- Node.js 18+
- Maven 3.9+ (or use the bundled tools)

### 1. Start the Backend

```bash
cd backend

# Add Maven to PATH (if not installed globally)
set PATH=%PATH%;C:\Users\SUGUMAR\tools\maven\apache-maven-3.9.6\bin

mvn spring-boot:run
```

- Runs on **http://localhost:8080**
- H2 in-memory DB auto-seeds with 16 demo transactions
- Swagger UI: **http://localhost:8080/swagger-ui.html**
- H2 Console: **http://localhost:8080/h2-console**

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

- Runs on **http://localhost:5173**
- All `/api/*` requests proxied to backend automatically

### 3. Login

| Role    | Email                  | Password      |
|---------|------------------------|---------------|
| Admin   | `admin@guardia.ai`     | `Admin@1234`  |
| Analyst | `analyst@guardia.ai`   | `Analyst@1234`|

---

## 🐳 Docker (One-Command Full Stack)

```bash
# Copy and configure env
cp .env.example .env

# Start everything
docker-compose up --build

# Access:
#   Frontend  → http://localhost
#   Backend   → http://localhost:8080
#   Swagger   → http://localhost:8080/swagger-ui.html
```

---

## 🔍 Fraud Detection Engine

Three rule-based checks implemented in `FraudDetectionService.java`:

| Rule | Trigger | Risk Score |
|------|---------|-----------|
| **Velocity Check** | > 3 transactions in 60 seconds per user | +35 |
| **Geo Impossibility** | Travel speed > 800 km/h between transactions (Haversine) | +45 |
| **Threshold Anomaly** | Amount > 400% of user's historical average | +30 |

Scores stack (max 100). Any triggered rule → `fraudulent = true`.

---

## 🤖 AI Explainability (Gemini)

Set `GEMINI_API_KEY` in `.env` to enable AI-generated fraud justifications.

Without a key → rule-based fallback explanation is used automatically. **No crash, no errors.**

```
GET /api/transactions → each response includes `aiExplanation` field
```

---

## 🔐 Security Features

- **JWT Authentication** — HMAC-SHA256, 24h expiry, stateless
- **HIBP Breach Check** — On every login, password hash prefix checked via k-anonymity
- **Spring Security** — Role-based access (ADMIN / ANALYST)
- **BCrypt** — All passwords hashed with BCrypt strength 10

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login → JWT + breach status |
| POST | `/api/transactions` | ✅ | Submit transaction for fraud check |
| GET  | `/api/transactions` | ✅ | Latest 100 transactions |
| GET  | `/api/transactions/flagged` | ✅ | All flagged transactions |
| GET  | `/api/dashboard/stats` | ✅ | Aggregate SOC statistics |

Full interactive docs: **http://localhost:8080/swagger-ui.html**

---

## 🗂️ Project Structure

```
fullstackproj/
├── backend/
│   ├── src/main/java/com/guardiaai/
│   │   ├── config/          FirebaseConfig, SwaggerConfig, DataInitializer
│   │   ├── controller/      AuthController, TransactionController, DashboardController
│   │   ├── dto/             Request/Response DTOs
│   │   ├── model/           Transaction, RiskEvent, AppUser
│   │   ├── repository/      JPA repositories
│   │   ├── security/        JwtUtil, JwtFilter, SecurityConfig
│   │   └── service/         FraudDetection, AiExplanation, BreachIntelligence, Firebase, Transaction
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      Sidebar, StatsCards, TransactionTable, RiskModal, FraudChart, SubmitForm
│   │   ├── pages/           LoginPage, DashboardPage
│   │   └── services/        api.js
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

---

## 🔧 Configuration

Copy `.env.example` → `.env` and fill in:

```env
GEMINI_API_KEY=         # Get from https://aistudio.google.com/app/apikey
FIREBASE_CREDENTIALS_PATH=  # Path to firebase-service-account.json (optional)
JWT_SECRET=             # Change to a strong random string in production
POSTGRES_PASSWORD=      # For Docker prod deployment
```

---

## 👤 Author

Built by **Sugumar** — SDE candidate demonstrating Java/React full-stack expertise with AI integration, enterprise security patterns, and DevOps containerization.
