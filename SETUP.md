# Guardia-AI Setup Guide

Complete setup instructions for local development and deployment.

## Prerequisites

- **Java 21+** (JDK)
- **Node.js 18+** with npm
- **Maven 3.9+**
- **Docker & Docker Compose** (for containerized deployment)
- **PostgreSQL 15+** (for production)
- **Git**

## Local Development Setup

### 1. Backend Configuration

```bash
cd backend

# Set JAVA_HOME if not set globally (Windows)
set JAVA_HOME=C:\path\to\java21

# Run with Spring Boot (H2 in-memory database)
mvn spring-boot:run

# Or build and run JAR
mvn clean package
java -jar target/guardia-ai-backend-1.0.0.jar
```

**Backend runs on:** `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console` (dev only)

**Demo Credentials:**
```
admin@guardia.ai / Admin@1234     (ADMIN role)
analyst@guardia.ai / Analyst@1234 (ANALYST role)
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (Vite)
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

### 3. Environment Variables

Create a `.env` file in the project root:

```dotenv
# Backend
JWT_SECRET=GuardiaAI-Super-Secret-Key-2024-256bits-Long!
JWT_EXPIRATION_MS=86400000
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend
VITE_API_URL=http://localhost:8080

# PostgreSQL (only for prod profile)
POSTGRES_USER=guardia
POSTGRES_PASSWORD=your_secure_password

# Firebase (optional)
FIREBASE_CREDENTIALS_PATH=path/to/firebase-service-account.json
```

## Docker Deployment

### Quick Start

```bash
# From project root
cp .env.example .env  # Configure if needed

# Build and run all services
docker-compose up --build

# Access:
# Frontend:  http://localhost
# Backend:   http://localhost:8080
# Swagger:   http://localhost:8080/swagger-ui.html
```

### Stop Services

```bash
docker-compose down

# With volume cleanup
docker-compose down -v
```

## API Testing

### Using Swagger UI
Navigate to `http://localhost:8080/swagger-ui.html` for interactive API documentation.

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@guardia.ai","password":"Admin@1234"}'
```

**Submit Transaction:**
```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user-101",
    "amount":1500,
    "merchantName":"Online Store",
    "latitude":13.0827,
    "longitude":80.2707
  }'
```

## Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

**Maven build failures:**
```bash
# Clean cache
mvn clean install -DskipTests

# Or update dependencies
mvn dependency:tree
```

### Frontend Issues

**Port 5173 already in use:**
```bash
npm run dev -- --port 3000
```

**API connection errors:**
- Verify `.env` has `VITE_API_URL=http://localhost:8080`
- Check backend is running: `curl http://localhost:8080/actuator/health`
- Verify CORS is enabled in SecurityConfig

### Database Issues

**H2 Console Access (Dev):**
Navigate to `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:guardiadb`
- User: `sa`
- Password: (empty)

## Production Build

### Backend

```bash
cd backend

# Build JAR for production
mvn clean package -DskipTests -Pprod

# Run with production profile
java -jar target/guardia-ai-backend-1.0.0.jar \
  -Dspring.profiles.active=prod \
  -DDATABASE_URL=jdbc:postgresql://your-postgres-host:5432/guardiadb \
  -DJWT_SECRET=your_secure_jwt_secret \
  -DGEMINI_API_KEY=your_api_key
```

### Frontend

```bash
cd frontend

# Build optimized bundle
npm run build

# Outputs to dist/ directory
# Deploy dist/ to static hosting or use nginx.conf in Docker
```

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string (>32 chars)
- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Enable HTTPS in production
- [ ] Disable H2 Console in production
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` in prod
- [ ] Configure CORS to specific domains only
- [ ] Use environment variables for sensitive data
- [ ] Regular backups of PostgreSQL

## Next Steps

1. **Customize Fraud Rules** → Edit `FraudDetectionService.java`
2. **Add Gemini API** → Get key from https://aistudio.google.com/app/apikey
3. **Enable Firebase** → Generate service account JSON from Firebase Console
4. **Configure Email Alerts** → Add your mail provider
5. **Add Tests** → Create unit/integration tests
6. **Deploy to Cloud** → AWS, Azure, GCP, etc.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for cloud deployment guides.
