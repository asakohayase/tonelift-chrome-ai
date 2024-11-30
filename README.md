# Docker and AWS Setup Instructions

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
- Remove all: `docker-compose down -v`