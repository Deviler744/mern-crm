# MERN Role-Based B2B Sales CRM

This repository contains an initial MERN stack scaffold for a role-based B2B Sales CRM.

## Structure
- `backend/` - Express.js API, MongoDB models, authentication, and role middleware
- `frontend/` - React UI with role-aware routing and sample pages

## Setup
1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

3. Seed the database with sample users:
   ```bash
   cd ../backend
   npm run seed
   ```

4. Start backend and frontend servers:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

## Seed Accounts
The database is seeded with sample accounts for testing. Use any email/password combination from the seeded users (password is "Password123!" for all).

## Roles
- **Admin**: Manages users, permissions, and reports. Admins can also remove user accounts.
- **Sales Manager**: Tracks team performance and lead conversions.
- **Sales Representative**: Updates customer details, leads, and activities.
- **Support Staff**: Handles customer support tickets and communication.

## Added Features
- Leaderboard for sales representatives
- Admin-only user deletion
- Secure admin role enforcement on user management APIs

## Notes
- Backend uses environment variables from `.env`.
- Frontend is configured with Vite and a role-based sidebar.
- The scaffold includes sample role-based React pages and basic API endpoints.
- Administrator users can manage CRM users on the `/users` page.

## Deployment
This project can be deployed as a single production app if the frontend is built and served by the backend.

1. Install dependencies:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
2. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
3. Configure environment variables for the backend:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT` (optional, defaults to 5000)
4. Start the backend in production mode:
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

### Recommended hosts
- Heroku / Railway / Render
- Fly.io
- DigitalOcean App Platform
- Azure App Service

### Notes for deployment hosts
- The backend now serves the frontend build from `frontend/dist` when `NODE_ENV=production`.
- If you deploy the backend and frontend separately, update `frontend/src/services/api.js` to point to the backend URL instead of `/api`.

## Docker deployment
You can deploy the app with Docker using the included `Dockerfile`.

Build the image:
```bash
cd d:/project
docker build -t mern-crm-app .
```

Run the container:
```bash
docker run -e MONGO_URI="<your-mongo-uri>" -e JWT_SECRET="<your-secret>" -p 5000:5000 mern-crm-app
```

Then open `http://localhost:5000`.

## Cloud deployment
This repository can also be deployed to a cloud Docker host such as Render, Fly.io, or Railway.

### Render example
1. Create a Render account and connect the GitHub repository.
2. Create a new Web Service.
3. Select `Docker` as the environment.
4. Set the build command to:
   ```bash
   docker build -t mern-crm-app .
   ```
5. Set the start command to:
   ```bash
   node backend/server.js
   ```
6. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT` (optional)

### Fly.io example
1. Install Fly CLI and login.
2. Run `fly launch` from the repo root.
3. When prompted, choose Docker and accept the defaults.
4. Add secrets:
   ```bash
   fly secrets set MONGO_URI="<your-mongo-uri>" JWT_SECRET="<your-secret>"
   ```
5. Deploy:
   ```bash
   fly deploy
   ```

### Railway example
1. Create a Railway project.
2. Connect the Git repo.
3. Use the existing `Dockerfile`.
4. Set environment variables in Railway for `MONGO_URI` and `JWT_SECRET`.
5. Deploy and use the generated app URL.
