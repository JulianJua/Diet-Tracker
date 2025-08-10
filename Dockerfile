# --- Build stage: build React app ---
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
# Install build tools and SQLite headers for any native deps (Debian)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     build-essential python3 ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install --omit=dev
COPY . .
RUN npm run build \
  && npm prune --omit=dev

# --- Runtime stage ---
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends sqlite3 libsqlite3-0 \
  && rm -rf /var/lib/apt/lists/*
COPY --from=build /app /app
RUN chown -R node:node /app
USER node

# Configure default envs (can be overridden)
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server/index.js"]


