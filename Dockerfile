# --- Build stage: build React app ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Install only what's needed for native builds (node-gyp)
RUN apk add --no-cache python3 make g++ sqlite-dev \
    && npm ci
COPY . .
RUN npm rebuild sqlite3 --build-from-source \
    && npm run build \
    && npm prune --omit=dev

# --- Runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache sqlite-libs
COPY --from=build /app /app

# Configure default envs (can be overridden)
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server/index.js"]


