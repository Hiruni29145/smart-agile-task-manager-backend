# Tour Web System Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A production-ready REST API for the Tourism Web Application built with NestJS, Prisma, and Supabase.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen" alt="Node Version" />
  <img src="https://img.shields.io/badge/npm-%3E%3D10.0.0-blue" alt="NPM Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NestJS-11.x-red" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-6.x-blueviolet" alt="Prisma" />
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Docker Setup](#-docker-setup)
- [Testing](#-testing)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- 🔐 **Authentication** - JWT-based auth with access/refresh tokens
- 📧 **Email Service** - Password reset, welcome emails
- 🔒 **Security** - Helmet, CORS, rate limiting
- 📊 **Health Checks** - Database and system monitoring
- 🔄 **Session Management** - Multi-device session tracking
- ⏰ **Scheduled Jobs** - Automatic session cleanup
- 🧪 **Testing** - 97%+ test coverage
- 🐳 **Docker** - Production-ready containerization
- 🚀 **CI/CD** - GitHub Actions with SonarQube

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS 11** | Backend framework |
| **TypeScript 5** | Type-safe development |
| **Prisma 6** | Database ORM |
| **PostgreSQL** | Database (via Supabase) |
| **JWT** | Authentication |
| **Nodemailer** | Email sending |
| **Docker** | Containerization |
| **GitHub Actions** | CI/CD pipeline |
| **SonarQube** | Code quality |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Installation |
|------|---------|--------------|
| **Node.js** | ≥ 22.0.0 | [Download](https://nodejs.org/) |
| **npm** | ≥ 10.0.0 | Comes with Node.js |
| **Docker** | Latest | [Download](https://docker.com/) |
| **Git** | Latest | [Download](https://git-scm.com/) |

### Verify Installation

```bash
node --version    # Should be v22.x.x
npm --version     # Should be 10.x.x
docker --version  # Should be 24.x.x or higher
```

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tour-web-system-backend.git
cd tour-web-system-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your values
notepad .env  # Windows
# or
nano .env     # Linux/Mac
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 5. Start the Application

```bash
# Development mode (hot reload)
npm run start:dev
```

### 6. Verify Installation

Open in browser: http://localhost:3000/api/v1/health

---

## ⚙️ Environment Setup

### Create `.env` file

Create a `.env` file in the root directory with the following variables:

```env
# ================================
# Application
# ================================
NODE_ENV=development
PORT=3000

# ================================
# Database (Supabase)
# ================================
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# ================================
# Supabase
# ================================
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ================================
# JWT Secrets (generate unique secrets!)
# ================================
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# ================================
# SMTP (Email)
# ================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Tourism App <noreply@tourism.com>

# ================================
# Frontend URL (for CORS & emails)
# ================================
FRONTEND_URL=http://localhost:3001

# ================================
# Rate Limiting
# ================================
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# ================================
# Session Config
# ================================
MAX_SESSIONS_PER_USER=5
```

### Generate JWT Secrets

```bash
# Generate secure random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Database Setup

### Using Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** to get connection strings
3. Add to `.env` file

### Run Migrations

```bash
# Apply all migrations
npx prisma migrate deploy

# Create new migration (development only)
npx prisma migrate dev --name migration_name

# View migration status
npx prisma migrate status

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## 🏃 Running the Application

### Development Mode

```bash
# With hot reload
npm run start:dev

# With debug mode
npm run start:debug
```

### Production Mode

```bash
# Build first
npm run build

# Start production server
npm run start:prod
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start in development |
| `npm run start:dev` | Start with hot reload |
| `npm run start:debug` | Start with debugger |
| `npm run start:prod` | Start production build |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run e2e tests |

---

## 🐳 Docker Setup

### Local Docker Development

```bash
# Build and start container
docker-compose up -d --build

# View logs
docker logs -f tour-api

# Stop container
docker-compose down

# Rebuild after changes
docker-compose up -d --build --force-recreate
```

### Docker Commands Reference

```bash
# Check running containers
docker ps

# Enter container shell
docker exec -it tour-api sh

# View container logs
docker logs tour-api --tail 100

# Restart container
docker restart tour-api

# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v
```

### Build Docker Image Manually

```bash
# Build image
docker build -t tour-api:latest .

# Run container
docker run -d \
  --name tour-api \
  -p 3000:3000 \
  --env-file .env \
  tour-api:latest
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Test Coverage

Current coverage: **97%+**

```
-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   97.29 |    79.65 |     100 |   97.11 |
-----------------------------|---------|----------|---------|---------|
```

---

## 📚 API Endpoints

### Base URL: `http://localhost:3000/api/v1`

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Full health status |
| GET | `/health/live` | Liveness check |
| GET | `/health/ready` | Readiness check |

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login | ❌ |
| POST | `/auth/refresh` | Refresh tokens | ❌ |
| POST | `/auth/logout` | Logout | ✅ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| POST | `/auth/reset-password` | Reset password | ❌ |
| POST | `/auth/change-password` | Change password | ✅ |
| GET | `/auth/me` | Get profile | ✅ |
| GET | `/auth/sessions` | List sessions | ✅ |
| DELETE | `/auth/sessions/:id` | Revoke session | ✅ |
| POST | `/auth/sessions/revoke-all` | Revoke all sessions | ✅ |

---

## 📁 Project Structure

```
tour-web-system-backend/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI pipeline
│   │   └── cd.yml              # CD pipeline
│   └── CODEOWNERS
├── docs/
│   └── DEPLOYMENT.md           # Deployment guide
├── prisma/
│   ├── migrations/             # Database migrations
│   └── schema.prisma           # Database schema
├── src/
│   ├── common/
│   │   ├── constants/          # Error codes, messages
│   │   ├── decorators/         # Custom decorators
│   │   ├── dto/                # Common DTOs
│   │   ├── enums/              # Enumerations
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards
│   │   ├── interceptors/       # Response interceptors
│   │   ├── interfaces/         # TypeScript interfaces
│   │   └── utils/              # Utility functions
│   ├── config/                 # Configuration files
│   ├── database/               # Prisma service
│   ├── modules/
│   │   ├── auth/               # Authentication module
│   │   ├── email/              # Email service
│   │   └── health/             # Health checks
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry
├── test/                       # E2E tests
├── .dockerignore
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── ecosystem.config.js         # PM2 config
├── nest-cli.json
├── package.json
├── sonar-project.properties    # SonarQube config
└── tsconfig.json
```

---

## 🔄 CI/CD Pipeline

### Continuous Integration (PR to main/develop)

```
Lint → Test → SonarQube → Build → Docker Test
```

### Continuous Deployment (Merge to main)

```
Build Docker → Push to GHCR → Migrate DB → Deploy → Health Check
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete CI/CD documentation.

---

## 🚀 Deployment

### Quick Deploy with PM2

```bash
# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# View logs
pm2 logs tour-api

# Restart
pm2 restart tour-api
```

### Deploy with Docker

```bash
# Build and push
docker build -t your-registry/tour-api:latest .
docker push your-registry/tour-api:latest

# On server
docker pull your-registry/tour-api:latest
docker-compose up -d
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide.

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `Cannot find module '@prisma/client'` | Run `npx prisma generate` |
| Database connection failed | Check `DATABASE_URL` in `.env` |
| Port 3000 already in use | Kill process or change `PORT` in `.env` |
| Docker build fails | Ensure Docker is running |
| Tests failing | Run `npm install` and `npx prisma generate` |

### Check Application Health

```bash
# Health endpoint
curl http://localhost:3000/api/v1/health

# Liveness check
curl http://localhost:3000/api/v1/health/live
```

### View Logs

```bash
# Development
npm run start:dev

# Docker
docker logs -f tour-api

# PM2
pm2 logs tour-api
```

---

## 📄 License

This project is [MIT licensed](LICENSE).

---

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For questions or support, please open an issue on GitHub.
