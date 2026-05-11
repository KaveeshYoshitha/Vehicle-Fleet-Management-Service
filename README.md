# Vehicle Fleet Management Service

## Prerequisites

- Node.js 18+ (or newer)
- MySQL 8+ (or compatible)

## Database setup

1. Create the database and tables:

Go to

```bash
    Backend/database/seed.sql
```

and run that file.

2. Seed dummy data and login users:

Go to

```bash
    Backend/database/seed.sql
```

and run that file.

## Backend setup

1. Create an environment file:

```bash
cd Backend
copy .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start the API server:

```bash
npm run dev
```

The backend runs on http://localhost:5000 by default.

## Frontend setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the web app:

```bash
npm run dev
```

The frontend runs on http://localhost:5173 by default.

## Seeded login accounts

- Admin: admin@fleet.com / admin123
- Fleet manager: sarah.j@fleet.com / password123
- Fleet manager: mike.w@fleet.com / password123
- Fleet staff: james.b@fleet.com / password123
- Fleet staff: emily.d@fleet.com / password123
- Fleet staff: robert.w@fleet.com / password123
