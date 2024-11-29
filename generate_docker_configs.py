#!/usr/bin/env python3
import os
import stat


def generate_frontend_env():
    content = """NEXT_PUBLIC_API_URL=http://localhost:8000"""
    with open("frontend/.env.local", "w") as f:
        f.write(content)
    print("✅ Generated frontend/.env.local")


def generate_frontend_dockerfile():
    content = """# Stage 1: Development dependencies & Build
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
"""
    with open("frontend/Dockerfile", "w") as f:
        f.write(content)
    print("✅ Generated frontend/Dockerfile")


def generate_backend_dockerfile():
    content = """# Use Python 3.12
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    ffmpeg \\
    gcc \\
    python3-dev \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy poetry files first
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \\
    && poetry install --no-interaction --no-ansi

# Copy the rest of the application
COPY . .

# Set PYTHONPATH to include src directory
ENV PYTHONPATH=/app/src

# Run the application from src directory
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
    with open("backend/Dockerfile", "w") as f:
        f.write(content)
    print("✅ Generated backend/Dockerfile")


def generate_docker_compose():
    content = """services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - CORS_ORIGINS=http://localhost:3000
    volumes:
      - ./backend:/app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge"""
    with open("docker-compose.yml", "w") as f:
        f.write(content)
    print("✅ Generated docker-compose.yml")


def generate_readme():
    content = """# Docker Setup Instructions

## Prerequisites
- Docker
- Docker Compose
- Poetry (for Python dependencies)

## Initial Setup
1. Install Poetry:
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. Initialize Poetry in backend:
   ```bash
   cd backend
   poetry init
   poetry add fastapi uvicorn python-multipart
   ```

## Quick Start
1. Start the application:
   ```bash
   docker-compose up --build
   ```

2. Access the services:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

3. Stop the application:
   ```bash
   docker-compose down
   ```

## Development
- Backend files are mounted as a volume, so changes are reflected immediately
- Frontend requires rebuild for changes: `docker-compose up --build frontend`

## Useful Commands
- View service status:
  ```bash
  docker-compose ps
  ```

- View service logs:
  ```bash
  docker-compose logs backend
  docker-compose logs frontend
  ```

- Remove all containers and volumes:
  ```bash
  docker-compose down -v
  ```"""
    with open("README.md", "w") as f:
        f.write(content)
    print("✅ Generated README.md")


def main():
    # Create directories if they don't exist
    os.makedirs("frontend", exist_ok=True)
    os.makedirs("backend", exist_ok=True)

    # Generate all configuration files
    generate_frontend_env()
    generate_frontend_dockerfile()
    generate_backend_dockerfile()
    generate_docker_compose()
    generate_readme()

    # Make the script executable
    current_file = __file__
    st = os.stat(current_file)
    os.chmod(current_file, st.st_mode | stat.S_IEXEC)

    print("\n🎉 All Docker configuration files have been generated!")
    print("\nNext steps:")
    print("1. Make sure you have Poetry installed in your backend:")
    print("   curl -sSL https://install.python-poetry.org | python3 -")
    print("2. Initialize Poetry in your backend directory:")
    print("   cd backend && poetry init")
    print("3. Add your dependencies:")
    print("   poetry add fastapi uvicorn python-multipart")
    print("4. Start the application:")
    print("   docker-compose up --build")


if __name__ == "__main__":
    main()
