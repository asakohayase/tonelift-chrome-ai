# Stage 1: Development dependencies & Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy environment files
COPY .env.local ./

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env.local ./

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
