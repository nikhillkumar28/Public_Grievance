# AI-Powered Public Grievance Platform

Node.js + Express + MongoDB backend plus React + Vite frontend for complaint filing, ML-based categorization, advisory management, analytics, duplicate detection, and escalation workflow.

## Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Copy env template:
```bash
copy .env.example .env
```

3. Start backend:
```bash
npm run dev
```

## Frontend Setup

1. Open the frontend app directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` inside `client/`:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start frontend:
```bash
npm run dev
```

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Complaints
- `POST /api/complaints` (citizen/admin)
- `GET /api/complaints`
- `GET /api/complaints/:id`
- `PATCH /api/complaints/:id/status` (authority/admin)
- `PATCH /api/complaints/:id/upvote` (citizen/admin)

### Advisories
- `POST /api/advisories` (admin)
- `GET /api/advisories/active` (public)

### Analytics
- `GET /api/analytics/status-distribution` (authority/admin)
- `GET /api/analytics/trending` (authority/admin)
- `GET /api/analytics/department-performance` (authority/admin)

### Utility
- `GET /health`

### Public Complaint Feed Endpoints
- `GET /api/complaints/public/overview`
- `GET /api/complaints/trending`
- `GET /api/complaints/public/recent`

## ML Integration

Backend calls:
- `POST ${ML_SERVICE_URL}`
```json
{ "text": "complaint text" }
```

Expected response:
```json
{
  "category": "Water Supply",
  "urgency": "High",
  "confidence": 0.92
}
```

If ML service is unavailable, backend falls back to `General / Medium / 0`.

## Escalation Job

Runs daily at `02:00` server time:
- Finds complaints where `status = pending`
- `createdAt <= 7 days old`
- `upvotes >= UPVOTE_ESCALATION_THRESHOLD`
- Updates status to `escalated` and appends timeline entry
