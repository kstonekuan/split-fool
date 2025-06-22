.PHONY: help dev prod build stop clean logs setup

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev      - Start development environment with hot reload"
	@echo "  make prod     - Start production environment"
	@echo "  make build    - Build production images"
	@echo "  make stop     - Stop all containers"
	@echo "  make clean    - Stop containers and remove volumes"
	@echo "  make logs     - View logs from all services"
	@echo "  make setup    - Initial setup (install dependencies)"
	@echo ""
	@echo "Service-specific commands:"
	@echo "  make logs-api - View API logs"
	@echo "  make logs-web - View web logs"
	@echo "  make logs-db  - View DynamoDB logs"
	@echo "  make shell-api - Open shell in API container"
	@echo "  make shell-web - Open shell in web container"

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml up

dev-build:
	docker-compose -f docker-compose.dev.yml up --build

dev-bg:
	docker-compose -f docker-compose.dev.yml up -d

# Production commands
prod:
	docker-compose up

prod-build:
	docker-compose up --build

prod-bg:
	docker-compose up -d

build:
	docker-compose build

# Stop and clean
stop:
	docker-compose -f docker-compose.dev.yml down || true
	docker-compose down || true

clean:
	docker-compose -f docker-compose.dev.yml down -v || true
	docker-compose down -v || true

# Logs
logs:
	docker-compose -f docker-compose.dev.yml logs -f

logs-api:
	docker-compose -f docker-compose.dev.yml logs -f api

logs-web:
	docker-compose -f docker-compose.dev.yml logs -f web

logs-db:
	docker-compose -f docker-compose.dev.yml logs -f dynamodb

# Shell access
shell-api:
	docker-compose -f docker-compose.dev.yml exec api sh

shell-web:
	docker-compose -f docker-compose.dev.yml exec web sh

# Setup
setup:
	pnpm install

# Test commands
test:
	docker-compose -f docker-compose.dev.yml exec api pnpm test

test-e2e:
	docker-compose -f docker-compose.dev.yml exec web pnpm test:e2e

# Database commands
db-admin:
	@echo "DynamoDB Admin UI has been removed from the project"

db-setup:
	docker-compose -f docker-compose.dev.yml run --rm setup-db

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:3000/health || echo "API is not healthy"
	@curl -f http://localhost:5173 || echo "Web is not healthy"
	@curl -f http://localhost:8000 || echo "DynamoDB is not healthy"