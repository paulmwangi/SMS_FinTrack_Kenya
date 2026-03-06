# SMS-FinTrack Kenya API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "role": "MEMBER"  // Optional: MEMBER, CHAIRMAN, TREASURER, AUDITOR, ADMIN
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MEMBER",
    "isActive": true
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MEMBER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
```http
GET /api/auth/me
```
*Requires authentication*

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MEMBER",
    "member": { ... }
  }
}
```

### Change Password
```http
POST /api/auth/change-password
```
*Requires authentication*

**Request Body:**
```json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

---

## Member Endpoints

### Create Member
```http
POST /api/members
```
*Requires authentication (ADMIN, CHAIRMAN, TREASURER)*

**Request Body:**
```json
{
  "userId": "user-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+254722123456",
  "nationalId": "12345678"
}
```

### Get All Members
```http
GET /api/members
```
*Requires authentication (ADMIN, CHAIRMAN, TREASURER, AUDITOR)*

**Response:**
```json
{
  "members": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+254722123456",
      "balance": 50000,
      "user": {
        "email": "john@example.com",
        "role": "MEMBER"
      }
    }
  ]
}
```

### Get Member by ID
```http
GET /api/members/:id
```
*Requires authentication*

### Update Member
```http
PUT /api/members/:id
```
*Requires authentication (ADMIN, CHAIRMAN, TREASURER)*

**Request Body:**
```json
{
  "firstName": "Jane",
  "phoneNumber": "+254722999888"
}
```

---

## Transaction Endpoints

### Get Transactions
```http
GET /api/transactions?startDate=2024-01-01&endDate=2024-01-31&type=DEPOSIT
```
*Requires authentication*

**Query Parameters:**
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `type` (optional): DEPOSIT, WITHDRAWAL, TRANSFER, FEE
- `bankProvider` (optional): MPESA, EQUITY, KCB, COOP
- `memberId` (optional, admin only): Filter by member

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "DEPOSIT",
      "amount": 5000,
      "balance": 50000,
      "description": "M-PESA deposit from...",
      "bankProvider": "MPESA",
      "reference": "RKH123ABC",
      "transactionDate": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Transaction by ID
```http
GET /api/transactions/:id
```
*Requires authentication*

---

## Statement Endpoints

### Generate Statement
```http
POST /api/statements/generate
```
*Requires authentication (ADMIN, TREASURER, CHAIRMAN)*

**Request Body:**
```json
{
  "memberId": "member-uuid",
  "month": 1,
  "year": 2024
}
```

**Response:**
```json
{
  "message": "Statement generated successfully",
  "statement": {
    "id": "uuid",
    "month": 1,
    "year": 2024,
    "openingBalance": 45000,
    "closingBalance": 50000,
    "totalDeposits": 10000,
    "totalWithdrawals": 5000,
    "pdfUrl": "/statements/statement-uuid-2024-1.pdf"
  }
}
```

### Get Statements
```http
GET /api/statements?memberId=uuid
```
*Requires authentication*

**Query Parameters:**
- `memberId` (optional, admin only): Filter by member

**Response:**
```json
{
  "statements": [
    {
      "id": "uuid",
      "month": 1,
      "year": 2024,
      "openingBalance": 45000,
      "closingBalance": 50000,
      "pdfUrl": "/statements/...",
      "generatedAt": "2024-02-01T02:00:00Z"
    }
  ]
}
```

### Get Statement by ID
```http
GET /api/statements/:id
```
*Requires authentication*

---

## SMS Endpoints

### Ingest SMS (Webhook)
```http
POST /api/sms/ingest
```
*Public endpoint for Africa's Talking webhook*

**Request Body:**
```json
{
  "from": "+254722123456",
  "text": "RKH123ABC Confirmed. Ksh5,000.00 sent to John Doe..."
}
```

**Response:**
```json
{
  "message": "SMS processed successfully",
  "transaction": {
    "id": "uuid",
    "type": "WITHDRAWAL",
    "amount": 5000,
    "balance": 45000
  }
}
```

---

## Supported SMS Formats

### M-Pesa
```
RKH123ABC Confirmed. Ksh5,000.00 sent to John Doe 0722123456 on 17/2/26 at 10:30 AM. New M-PESA balance is Ksh15,000.00
```

### Equity Bank
```
Your Equity a/c XXX1234 has been credited with KES 10,000.00 on 17/02/26. Bal: KES 50,000.00. Ref: FT26048RKH
```

### KCB
```
KCB A/C XXX456 Credited with KShs 20,000.00 on 17-Feb-26. Avail Bal KShs 70,000.00. Ref TXN123456
```

### Co-operative Bank
```
Co-operative Bank A/C XXX789 CR KES 15,000.00 on 17/02/26. Bal KES 60,000.00. Ref: COOP123456
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Transaction not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Authenticated requests**: 100 requests per minute
- **Public endpoints**: 20 requests per minute

---

## Pagination

For endpoints returning lists, use these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 30, max: 100)

Example:
```http
GET /api/transactions?page=2&limit=50
```

---

## Webhooks

### SMS Webhook Configuration

Configure your Africa's Talking account to send POST requests to:
```
https://api.yourdomain.com/api/sms/ingest
```

**Expected Format:**
```json
{
  "from": "+254722123456",
  "text": "SMS content here..."
}
```

---

## Testing

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Code Examples

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Login
const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });
  return response.data;
};

// Get transactions (authenticated)
const getTransactions = async (token: string) => {
  const response = await axios.get(`${API_URL}/transactions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
```

### Python

```python
import requests

API_URL = 'http://localhost:5000/api'

# Login
def login(email, password):
    response = requests.post(f'{API_URL}/auth/login', json={
        'email': email,
        'password': password
    })
    return response.json()

# Get transactions
def get_transactions(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{API_URL}/transactions', headers=headers)
    return response.json()
```

### cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get transactions
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Support

- **Documentation**: https://docs.yourdomain.com
- **Email**: support@yourdomain.com
- **GitHub**: https://github.com/paulmwangi/SMS_FinTrack
