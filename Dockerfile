# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Déclarer les variables VITE_ comme ARG (nécessaires au build time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Les rendre disponibles dans l'environnement de build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "serve dist -l ${PORT:-3000} --single"]
