# Payment Service API

A production-grade payment backend built with NestJS and MongoDB. Supports user authentication, wallet management, and peer-to-peer money transfers with atomic transactions and idempotency protection.

---

## Features

- **JWT Authentication** — signup, signin, bcrypt password hashing, 6-digit transaction PIN
- **Account lockout** — account temporarily locked after 5 failed login attempts (15-minute lock, auto-cleared on expiry)
- **Wallet system** — NGN wallet auto-created on signup, deposit and transfer endpoints
- **Atomic transfers** — debit and credit wrapped in MongoDB sessions; both succeed or both fail
- **Idempotency keys** — prevents duplicate transfers on network retry, keys expire after 24 hours
- **Soft delete** — user accounts and wallets deactivated without permanent data loss
- **Response sanitization** — sensitive fields (password, PIN) never returned in API responses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| Database | MongoDB (Mongoose) |
| Authentication | Passport.js, JWT |
| Validation | class-validator, class-transformer |
| Config | @nestjs/config, Joi |
| Unique IDs | uuid |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)

### Installation

```bash
git clone https://github.com/Willy0la/payment.git
cd payment
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/payment
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=3000
```

### Running the App

```bash
# development
npm run start:dev

# production
npm run start:prod
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/signup` | Register a new user | None |
| POST | `/auth/signin` | Login with email/username + password or PIN | None |

**Signup body:**
```json
{
  "name": "John Doe",
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "transactionPin": "123456",
  "phoneNumber": "+2348012345678"
}
```

> Account number is derived automatically from the last 10 digits of the phone number.

**Signin body:**
```json
{
  "identifier": "johndoe",
  "password": "securepassword"
}
```

> Provide either `password` or `transactionPin`, not both.

---

### Wallet

All wallet endpoints require a Bearer token from signin.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/wallet/deposit` | Add funds to wallet | Required |
| POST | `/wallet/send-money` | Transfer funds to another user | Required |

**Deposit body:**
```json
{
  "amount": 5000
}
```

**Send money body:**
```json
{
  "receiverAccountNumber": "8012345678",
  "amount": 1000,
  "reference": "Payment for services",
  "idempotencyKey": "unique-request-id-123"
}
```

> `idempotencyKey` is optional but recommended. If a transfer request is retried with the same key, the original response is returned without processing a duplicate transaction.

---

### Transactions

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/transaction/history` | Get user's transaction history | Required |
| GET | `/transaction/:id` | Get transaction by ID | Required |

---

## Key Design Decisions

**Atomic transfers with MongoDB sessions**
The `sendMoney` flow uses `session.withTransaction()` to ensure the sender debit and receiver credit are atomic. If either operation fails, the entire transaction rolls back.

**Race-condition-safe balance check**
Rather than reading the balance first and checking in application code, the decrement query uses `{ balance: { $gte: amount } }` as a condition. The update only applies if the balance is sufficient — no separate read that could race under concurrent requests.

**Idempotency**
Each transfer can include an `idempotencyKey`. Before processing, the service checks if this key has been used. If the previous request succeeded, the original response is returned immediately. If it's in a failed state, a `400` is thrown. Keys expire after 24 hours via a MongoDB TTL index.

---

## Planned Improvements

- [ ] BullMQ queue for async transaction processing and reversals
- [ ] Redis caching for transaction history and wallet balance reads
- [ ] Optimistic concurrency (version field) for high-concurrency environments
- [ ] Swagger / OpenAPI documentation
- [ ] Comprehensive E2E test suite