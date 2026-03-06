# SMS-FinTrack Kenya - Testing Guide

This guide helps you test the SMS-FinTrack Kenya system locally before deployment.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL 15 running locally
- Redis 7 (optional)

## Quick Start

### 1. Setup Database

```bash
# Start PostgreSQL (if using Docker)
docker run --name sms-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Create database
psql -U postgres -h localhost
CREATE DATABASE sms_fintrack;
\q
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env and set DATABASE_URL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sms_fintrack

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with test data
npm run seed

# Start development server
npm run dev
```

Backend should now be running on http://localhost:5000

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend should now be running on http://localhost:5173

## Test Credentials

After running the seed script, you can login with these credentials:

- **Admin**: admin@smsfintrack.co.ke / Admin123!
- **Treasurer**: treasurer@smsfintrack.co.ke / Treasurer123!
- **Member**: john.doe@example.com / Member123!

## Manual Testing Scenarios

### Scenario 1: User Authentication

1. Open http://localhost:5173
2. Login with member credentials
3. Verify dashboard loads with transactions
4. Test logout
5. Login with admin credentials
6. Verify different permissions/views

### Scenario 2: SMS Parsing

Test the SMS parser with different bank formats:

```bash
# M-Pesa SMS
curl -X POST http://localhost:5000/api/sms/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+254722123456",
    "text": "RKH123XYZ Confirmed. Ksh5,000.00 sent to John Doe 0722123456 on 17/2/26 at 10:30 AM. New M-PESA balance is Ksh20,000.00"
  }'

# Equity Bank SMS
curl -X POST http://localhost:5000/api/sms/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+254722123456",
    "text": "Your Equity a/c XXX1234 has been credited with KES 10,000.00 on 17/02/26. Bal: KES 30,000.00. Ref: FT26048ABC"
  }'

# KCB SMS
curl -X POST http://localhost:5000/api/sms/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+254722123456",
    "text": "KCB A/C XXX456 Credited with KShs 8,000.00 on 17-Feb-26. Avail Bal KShs 38,000.00. Ref TXN789DEF"
  }'
```

### Scenario 3: Statement Generation

```bash
# Login as admin/treasurer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "treasurer@smsfintrack.co.ke",
    "password": "Treasurer123!"
  }'

# Use the token from response
export TOKEN="your-jwt-token-here"

# Get member ID (from dashboard or API)
export MEMBER_ID="member-uuid-here"

# Generate statement
curl -X POST http://localhost:5000/api/statements/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "memberId": "'$MEMBER_ID'",
    "month": 1,
    "year": 2024
  }'
```

### Scenario 4: Transaction Filtering

```bash
# Get transactions for date range
curl -X GET "http://localhost:5000/api/transactions?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"

# Filter by type
curl -X GET "http://localhost:5000/api/transactions?type=DEPOSIT" \
  -H "Authorization: Bearer $TOKEN"

# Filter by bank
curl -X GET "http://localhost:5000/api/transactions?bankProvider=MPESA" \
  -H "Authorization: Bearer $TOKEN"
```

## Automated Testing

### Backend Tests (To be added)

```bash
cd backend
npm test
```

### Frontend Tests (To be added)

```bash
cd frontend
npm test
```

## Database Inspection

### Using Prisma Studio

```bash
cd backend
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can browse and edit database records.

### Using psql

```bash
psql -U postgres -d sms_fintrack

# View users
SELECT * FROM "User";

# View members
SELECT * FROM "Member";

# View transactions
SELECT * FROM "Transaction";

# View statements
SELECT * FROM "Statement";
```

## Common Issues

### Database Connection Error

```
Error: Can't reach database server
```

**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct in .env

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Stop the process using port 5000 or change PORT in .env

### Prisma Client Not Generated

```
Error: @prisma/client did not initialize yet
```

**Solution**: Run `npm run prisma:generate`

### Build Errors

```
Error: Cannot find module '@prisma/client'
```

**Solution**: 
```bash
npm install
npm run prisma:generate
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:5000/api/auth/login

# Create login.json
echo '{"email":"john.doe@example.com","password":"Member123!"}' > login.json
```

### Memory Usage Monitoring

```bash
# Monitor memory usage
node --inspect src/index.ts

# Open Chrome DevTools
chrome://inspect
```

## Security Testing

### Check for Vulnerabilities

```bash
cd backend
npm audit

# Fix vulnerabilities
npm audit fix
```

### Test JWT Expiration

```bash
# Set short expiration in .env
JWT_EXPIRES_IN=10s

# Login and wait 15 seconds
# Try to access protected route - should fail with 401
```

## Integration Testing Checklist

- [ ] User can register
- [ ] User can login
- [ ] User can change password
- [ ] SMS ingestion creates transactions
- [ ] All bank SMS formats are parsed correctly
- [ ] Transactions are linked to correct members
- [ ] Balances are updated correctly
- [ ] Statements are generated with correct data
- [ ] PDFs are created successfully
- [ ] Role-based access control works
- [ ] Admin can view all members
- [ ] Members can only view own data
- [ ] Health check endpoint returns 200
- [ ] Invalid routes return 404
- [ ] Unauthorized requests return 401
- [ ] Forbidden requests return 403

## Docker Testing

```bash
# Build and run with Docker Compose
docker-compose up --build

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop containers
docker-compose down
```

## Production-Like Testing

```bash
# Build for production
cd backend
npm run build

# Start with production settings
NODE_ENV=production node dist/index.js

# Test frontend production build
cd frontend
npm run build
npx serve dist -l 3000
```

## Monitoring Tests

### Check Logs

```bash
# Backend logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

### Health Check

```bash
# Should return {"status":"ok"}
curl http://localhost:5000/health
```

## Reset Database

```bash
cd backend

# Warning: This deletes all data!
npx prisma migrate reset

# Re-seed
npm run seed
```

## Next Steps

Once local testing is complete:

1. Run all integration tests
2. Fix any issues found
3. Test with production-like data volumes
4. Review security audit
5. Proceed with deployment

## Support

For testing issues:
- Check logs in `backend/logs/`
- Review error messages carefully
- Consult API.md for endpoint documentation
- Open GitHub issue if problem persists
