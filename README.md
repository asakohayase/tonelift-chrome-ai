# Docker Setup Instructions

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
  ```