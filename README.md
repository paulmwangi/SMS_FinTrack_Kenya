# SMS-FinTrack Kenya

A comprehensive SMS-based financial tracking system for Kenyan Saccos, investment groups, and real estate companies. Automatically parses bank SMS alerts, tracks transactions, and generates professional monthly PDF statements.

## Features

- 📱 **SMS Parsing**: Automatically parse bank & M-Pesa SMS messages (Equity, KCB, M-Pesa, Co-op)
- 💰 **Transaction Management**: Store, filter, and track all financial transactions
- 📊 **Analytics Dashboard**: Real-time financial overview with interactive charts and stat cards
- 🔐 **Role-Based Access**: Chairman, Treasurer, Auditor, Member, Admin roles with granular permissions
- 📄 **PDF Statements**: Generate and download monthly statements for members
- 👥 **Member Management**: Full member profiles with balance tracking
- 📨 **SMS Ingestion**: Manual SMS testing interface with sample templates
- ⚙️ **Settings**: User profile management and password change
- 🎨 **Modern UI/UX**: Beautiful dashboard with sidebar navigation, glassmorphism cards, and charts

## Tech Stack

### Backend
- **Runtime**: Node.js v20 LTS
- **Framework**: Express.js v5
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL 15 with Prisma ORM
- **Authentication**: Passport.js + JWT
- **PDF Generation**: Puppeteer
- **Scheduler**: node-cron (automated monthly statements)
- **Logging**: Winston

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Testing**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (recommended)
- PostgreSQL 15 (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/paulmwangi/SMS_FinTrack.git
cd SMS_FinTrack
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and JWT_SECRET
npx prisma generate
npx prisma migrate dev
npm run seed          # Creates test data
npm run dev           # Starts on port 5000
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
npm run dev           # Starts on port 5173
```

4. **Run with Docker Compose (Recommended)**
```bash
# From project root
docker-compose up -d
```

### Test Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smsfintrack.co.ke | Admin123! |
| Treasurer | treasurer@smsfintrack.co.ke | Treasurer123! |
| Member | john.doe@example.com | Member123! |

## Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Modern split-layout login with animated gradient |
| Dashboard | `/dashboard` | Stat cards, area charts, recent transactions, activity feed |
| Transactions | `/transactions` | Filterable transaction list with date range, type, and bank filters |
| Members | `/members` | Member cards with search, add member modal |
| Statements | `/statements` | Generate and download monthly PDF statements |
| SMS Ingestion | `/sms` | Manual SMS testing with sample templates for each bank |
| Settings | `/settings` | Profile info, password change |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/me` - Get current user info

### Members
- `POST /api/members` - Create member (Admin/Chairman/Treasurer)
- `GET /api/members` - List all members (Admin/Chairman/Treasurer/Auditor)
- `GET /api/members/:id` - Get member details
- `PUT /api/members/:id` - Update member (Admin/Chairman/Treasurer)

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `GET /api/transactions/:id` - Get transaction details

### SMS
- `POST /api/sms/ingest` - SMS webhook endpoint (public)

### Statements
- `POST /api/statements/generate` - Generate monthly statement
- `GET /api/statements` - List statements
- `GET /api/statements/:id` - Get statement details

## User Roles

| Role | Permissions |
|------|------------|
| **ADMIN** | Full system access, user management |
| **CHAIRMAN** | View all reports, manage members and statements |
| **TREASURER** | Manage finances, generate statements, manage members |
| **AUDITOR** | Read-only access to all records |
| **MEMBER** | View own transactions and statements |

## Running Tests

```bash
# Backend tests (Jest)
cd backend && npm test

# Frontend tests (Vitest)
cd frontend && npm test

# Frontend lint
cd frontend && npm run lint
```

## Documentation

- [API Documentation](API.md) - Complete API reference with examples
- [Deployment Guide](DEPLOYMENT.md) - Railway, Render, DigitalOcean guides
- [Testing Guide](TESTING.md) - Testing scenarios and curl examples
- [Implementation Details](IMPLEMENTATION.md) - Architecture and feature status
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

## License

ISC
