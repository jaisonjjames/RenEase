# Rentco Deployment Guide

This app is split into:

- `frontend`: Vite + React
- `backend`: Express + MongoDB

## Recommended hosting

### Best free-friendly option

- Frontend: Vercel Hobby
- Backend API: Render web service
- Database: MongoDB Atlas M0 free cluster

Why this setup:

- Vercel is the smoothest free host for Vite/React frontends.
- MongoDB Atlas is still the most practical free MongoDB option.
- Render is simple for Node APIs, though free services can sleep after inactivity.

### Best low-cost option

- Frontend: Vercel
- Backend API: Railway or Render paid tier
- Database: MongoDB Atlas

If you want the app to feel reliably live for real users, this is the stronger choice because free backend tiers usually sleep or have tighter limits.

## Environment variables

### Backend

Create `backend/.env` from `backend/.env.example`.

Required for production:

- `NODE_ENV=production`
- `PORT=10000`
- `MONGO_URI=<your atlas connection string>`
- `JWT_SECRET=<long random secret>`
- `CORS_ORIGIN=<your frontend url>`

Optional:

- `ENABLE_DEMO_SEEDING=false`
- `USE_IN_MEMORY_DB=false`
- `SUPERADMIN_NAME=<only if you intentionally want demo seeding>`
- `SUPERADMIN_EMAIL=<only if you intentionally want demo seeding>`
- `SUPERADMIN_PASSWORD=<only if you intentionally want demo seeding>`

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

- `VITE_API_BASE_URL=<your backend public url>`

Examples:

- Local frontend to local backend: `http://localhost:5001`
- Vercel frontend to Render backend: `https://your-api-name.onrender.com`

## Local production checklist

1. Install dependencies:

```bash
npm install
```

2. Fill in local env files:

- `backend/.env`
- `frontend/.env`

3. Build both apps:

```bash
npm run build
```

4. Run the backend production build locally:

```bash
cd backend
npm start
```

5. In another terminal, preview the frontend:

```bash
cd frontend
npm run preview
```

## MongoDB Atlas setup

1. Create a free Atlas project and cluster.
2. Create a database user with a strong password.
3. In Network Access, allow your deployment platforms to connect.
   For quick setup, many people temporarily allow `0.0.0.0/0`, but restricting access later is better.
4. Copy the connection string and replace `<password>` and database name.
5. Put that string into backend `MONGO_URI`.

## Deploy backend on Render

1. Push this repo to GitHub.
2. In Render, create a new Web Service.
3. Connect the GitHub repo.
4. Set:

- Root Directory: `backend`
- Environment: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

5. Add environment variables:

- `NODE_ENV=production`
- `MONGO_URI=...`
- `JWT_SECRET=...`
- `CORS_ORIGIN=https://your-frontend-domain.vercel.app`
- `ENABLE_DEMO_SEEDING=false`
- `USE_IN_MEMORY_DB=false`

6. Deploy and test:

- `https://your-backend-domain.onrender.com/api/health`

## Deploy frontend on Vercel

1. In Vercel, import the same GitHub repo.
2. Set:

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

3. Add environment variable:

- `VITE_API_BASE_URL=https://your-backend-domain.onrender.com`

4. Deploy.

## After first deploy

1. Open the frontend.
2. Create your first real admin with the CLI script below instead of relying on demo credentials.
3. Confirm:

- login works
- categories load
- assets load
- admin dashboard can read data
- profile loads
- `GET /api/health` returns OK

## Create the first production admin

Preferred option if you already registered the user once:

```bash
cd backend
npm run make-admin -- --email you@example.com --role superadmin
```

If the user does not exist yet, create them directly:

```bash
cd backend
npm run make-admin -- --email you@example.com --name "Your Name" --password "Choose-A-Strong-Password" --role superadmin
```

For safety, this is a server-side script only. It does not expose any public admin-creation endpoint.

## Important production notes

- The backend no longer silently falls back to an in-memory database unless you explicitly enable it with `USE_IN_MEMORY_DB=true`.
- Demo data and the default superadmin are now controlled by `ENABLE_DEMO_SEEDING`. Keep this `false` in production.
- CORS is now controlled by `CORS_ORIGIN`. If your frontend domain changes, update it in the backend host.
- The frontend now uses `VITE_API_BASE_URL`, so you can point it to any deployed API without code changes.

## Alternative: Railway

Railway is nice if you want a simpler backend deployment flow, but its current free offering is much more limited for ongoing live use than a typical always-available production setup. If you choose Railway:

1. Create a service from the repo.
2. Set the root directory to `backend`.
3. Use the same env vars listed above.
4. Keep MongoDB on Atlas instead of using temporary local-only storage.
