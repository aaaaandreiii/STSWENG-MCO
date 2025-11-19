# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# App listens on PORT (default 3000 if not set)
EXPOSE 3000
CMD ["node", "index.js"]