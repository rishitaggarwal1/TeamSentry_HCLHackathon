# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install deps (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Vite env must be available at BUILD time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build
RUN npm run build


# ---------- Nginx stage ----------
FROM nginx:1.27-alpine

# Remove default nginx html (optional, clean)
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Nginx runs in foreground
CMD ["nginx", "-g", "daemon off;"]
