# --- Build stage: build React app ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app .

# Configure default envs (can be overridden)
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server/index.js"]


