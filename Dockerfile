# Build the frontend and backend, then run the backend in production mode

FROM node:20-alpine AS deps
WORKDIR /app

# Copy package manifests and install dependencies separately for caching
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

RUN cd frontend && npm install
RUN cd backend && npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

RUN cd frontend && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "server.js"]
