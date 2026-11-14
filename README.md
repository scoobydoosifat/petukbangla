# Petuk Bangla

Petuk Bangla is a focused two-feature full-stack project:

1. **Food Map** — a visitor marks traditional foods they have tried, sees district shapes filled with food-matched solid colors, tracks completion out of 100%, and exports a branded PNG card.
2. **Food Exploration** — account required. Members discover and publish exact Dhaka food-place pins with details and an optional compressed photo.

The scope intentionally excludes payment, email verification, restaurant booking, ratings, and general social-network features.

The bundled curated catalog contains **106 edible entries across 62 districts** from the reference guide. Narayanganj and Jamalpur remain visible on the 64-district map but are not selectable because the source lists only non-food heritage items for them.

## Stack

- Frontend: React 18, Vite, React Router, Leaflet with detailed key-free OpenStreetMap street tiles, html-to-image
- Backend: Java 21, Spring Boot 3.5, Spring Security, JWT, Spring Data MongoDB
- Database and image storage: MongoDB Atlas only. Optional pin photos are compressed in the browser and stored as bounded data URLs; there is no Cloudinary dependency.
- Deployment: Vercel (`frontend`) and Render Docker (`backend`)

## Project structure

```text
Petuk Bangla/
├── backend/
│   ├── src/main/java/com/petukbangla/
│   │   ├── config/       # security and initial food/admin data
│   │   ├── controller/   # REST endpoints
│   │   ├── dto/          # validated API contracts
│   │   ├── exception/    # stable error responses
│   │   ├── model/        # MongoDB documents
│   │   ├── repository/   # Mongo repositories
│   │   ├── security/     # JWT filter and token service
│   │   └── service/      # business rules
│   └── src/test/         # unit tests
├── frontend/
│   ├── public/data/      # simplified 64-district geometry
│   ├── public/images/    # local traditional-food thumbnails
│   └── src/              # pages, components, auth, tests, utilities
├── render.yaml
└── ATTRIBUTIONS.md
```

## Local development

Requirements: Java 21, Maven 3.9+, Node 22.22+, and MongoDB (local or Atlas).

Backend:

```bash
cd backend
cp .env.example .env
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The app opens at `http://localhost:5173`; the API defaults to `http://localhost:9092/api`.

## API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create account and receive JWT |
| `POST` | `/api/auth/login` | Public | Sign in |
| `GET` | `/api/auth/me` | User | Restore signed-in profile |
| `GET` | `/api/foods` | Public | Traditional-food catalog |
| `GET` | `/api/places` | User | Active Dhaka pins |
| `POST` | `/api/places` | User | Publish a validated Dhaka pin |
| `DELETE` | `/api/places/{id}` | Owner/Admin | Soft-delete a pin |
| `PUT` | `/api/users/me/password` | User | Verify and update password |
| `DELETE` | `/api/users/me` | User | Verify password, hide pins, and delete account |
| `GET` | `/api/health` | Public | Render health check |

## Testing

```bash
cd backend && mvn test
cd frontend && npm test
```

The current suite has 15 backend tests and 15 frontend tests. It covers registration/login, JWTs, catalog integrity/mapping, pin creation and deletion responses, high-accuracy geolocation safeguards, photo validation, ownership, account password/deletion rules, guest selection persistence/progress, solid district colors, confirmations, map selection, and submission-button duplicate-click guards.

## Deploy

### Backend on Render

Create a Blueprint from `render.yaml` or deploy `backend/Dockerfile`. Set `MONGODB_URI`, `FRONTEND_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Use the Vercel production origin for `FRONTEND_URL` without a trailing slash.

### Frontend on Vercel

Import the repository, set the Root Directory to `Petuk Bangla/frontend`, and set:

```text
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
```

The included `vercel.json` keeps client-side routes working on refresh.

## Important implementation notes

- Food Map selections live in browser `localStorage`, so guest use never creates an account or database record.
- All async submission buttons disable while running to prevent duplicate values.
- Pin coordinates are constrained to a Dhaka bounding box on both the UI and API.
- A single optional photo is compressed to about 900 px before upload and validated as a bounded image data URL. This keeps the Mongo-only design simple and under MongoDB's document limit.
- The place feed polls every 20 seconds. This is deliberately simpler than maintaining WebSocket infrastructure on a small Render deployment.
