#!/usr/bin/env python3
import os
import stat


def generate_frontend_dockerfile():
    content = """# Stage 1: Development dependencies & Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

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

# Set environment to production
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]"""
    with open("frontend/Dockerfile", "w") as f:
        f.write(content)
    print("✅ Generated frontend/Dockerfile")


def generate_backend_dockerfile():
    content = """FROM python:3.12-slim

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
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]"""
    with open("backend/Dockerfile", "w") as f:
        f.write(content)
    print("✅ Generated backend/Dockerfile")


def generate_docker_compose():
    content = """services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      platforms:
        - linux/amd64
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
      platforms:
        - linux/amd64
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


def generate_aws_config():
    os.makedirs("aws-config", exist_ok=True)

    task_policy = """{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        }
    ]
}"""
    with open("aws-config/task-execution-policy.json", "w") as f:
        f.write(task_policy)
    print("✅ Generated task-execution-policy.json")


def generate_readme():
    content = """# Docker and AWS Setup Instructions

## Local Development
### Prerequisites
- Docker
- Docker Compose
- Poetry (Python package manager)
- AWS CLI v2

### Local Setup
1. Start the application:
   ```bash
   docker-compose up --build
   ```

2. Access local services:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

### AWS Deployment Steps
1. Configure AWS CLI with SSO:
   ```bash
   aws configure sso
   aws sso login --profile AdministratorAccess-[AccountID]
   ```

2. Create ECR repositories:
   ```bash
   aws ecr create-repository --repository-name tonelift-ai-frontend
   aws ecr create-repository --repository-name tonelift-ai-backend
   ```

3. Set up IAM roles and policies:
   ```bash
   cd aws-config
   aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
   aws iam put-role-policy --role-name ecsTaskExecutionRole --policy-name ecsTaskExecutionPolicy --policy-document file://task-execution-policy.json
   ```

4. Create ECS resources:
   ```bash
   aws ecs create-cluster --cluster-name tonelift-ai-cluster
   ```

## Useful Commands
- View status: `docker-compose ps`
- View logs: `docker-compose logs [service]`
- Rebuild: `docker-compose up --build`
- Remove all: `docker-compose down -v`"""
    with open("README.md", "w") as f:
        f.write(content)
    print("✅ Generated README.md")


def main():
    os.makedirs("frontend", exist_ok=True)
    os.makedirs("backend", exist_ok=True)

    generate_frontend_dockerfile()
    generate_backend_dockerfile()
    generate_docker_compose()
    generate_aws_config()
    generate_readme()

    current_file = __file__
    st = os.stat(current_file)
    os.chmod(current_file, st.st_mode | stat.S_IEXEC)

    print("\n🎉 All configuration files have been generated!")
    print("\nNext steps:")
    print("1. Install Poetry: curl -sSL https://install.python-poetry.org | python3 -")
    print("2. Initialize backend: cd backend && poetry init")
    print("3. Install dependencies: poetry add fastapi uvicorn")
    print("4. Start local development: docker-compose up --build")


if __name__ == "__main__":
    main()
