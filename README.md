# DevPulse

**Internal Tech Issue & Feature Tracker** — A collaborative REST API for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL

```
https://l2-a2-dev-pulse-server-with-postgre.vercel.app/
```

## Tech Stack

| Technology | Usage |
|---|---|
| Node.js 24.x | LTS Runtime |
| TypeScript (latest) | Strict typing, no `any` |
| Express.js | Modular router architecture |
| PostgreSQL (NeonDB) | Relational database |
| `pg` (native driver) | Raw `pool.query()` — no ORM, no JOINs |
| bcrypt | Password hashing (10 salt rounds) |
| jsonwebtoken | JWT auth, 7-day expiry |

## Features

- JWT authentication with role-based access control (`contributor` / `maintainer`)
- Full issue lifecycle: create, read, update, delete
- Filtering by `type` and `status` — sorting by `newest` / `oldest`
- Reporter details fetched without SQL JOINs using batch `WHERE id = ANY()`
- Centralized error handling and consistent response format
- No ORMs, no query builders, no SQL JOINs — raw SQL throughout

## Project Structure

```
src/
├── db/
│   └── index.ts                  ← PostgreSQL connection pool
├── middlewere/
│   ├── auth.ts                   ← JWT verification → sets req.user
│   ├── errorHandler.ts           ← Centralized error handler
│   └── roleGuard.ts              ← Blocks non-maintainers (403)
├── modules/
│   ├── auth/                     ← signup, login
│   └── issues/
│       ├── issues.controller.ts  ← create, getAll, getById, update, delete
│       └── issues.route.ts
├── types/
│   └── index.ts                  ← All interfaces and types
├── utils/
│   ├── dbQuery.ts                ← queryOne() / queryMany() / queryRun()
│   └── responseHelper.ts        ← sendSuccess() / sendError()
├── app.ts                        ← Express app, routes, middleware
└── index.ts                      ← Server entry point (listen)
```

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | Auto-increment |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Unique, required |
| password | TEXT | bcrypt hashed, never returned |
| role | VARCHAR(20) | `contributor` or `maintainer`, default `contributor` |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

### `issues`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | Auto-increment |
| title | VARCHAR(150) | Required, max 150 chars |
| description | TEXT | Required, min 20 chars |
| type | VARCHAR(20) | `bug` or `feature_request` |
| status | VARCHAR(20) | `open`, `in_progress`, `resolved` — default `open` |
| reporter_id | INTEGER | App-level validation (no FK constraint) |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| POST | `/api/issues` | Authenticated | Create a bug or feature request |
| GET | `/api/issues` | Public | Get all issues (filterable, sortable) |
| GET | `/api/issues/:id` | Public | Get a single issue with reporter info |
| PATCH | `/api/issues/:id` | Authenticated | Update issue (role/ownership rules apply) |
| DELETE | `/api/issues/:id` | Maintainer only | Permanently delete an issue |

### Query Parameters — `GET /api/issues`

| Param | Values | Default |
|---|---|---|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | — |
| `status` | `open`, `in_progress`, `resolved` | — |
