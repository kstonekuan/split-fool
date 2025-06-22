# Docker Setup for SplitFool

This project includes comprehensive Docker support for both development and production environments.

## Quick Start

### Development Mode (with hot reload)

```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

Access the application:
- Web UI: http://localhost:5173
- API: http://localhost:3000
- DynamoDB Admin: http://localhost:8001

### Production Mode

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d

# Stop services
docker-compose down
```

Access the application:
- Web UI: http://localhost
- API: http://localhost:3000
- DynamoDB Admin: http://localhost:8001 (only with --profile dev)

## Services

### Core Services

1. **web** - Svelte frontend served by nginx
   - Development: Vite dev server with hot reload on port 5173
   - Production: Static files served by nginx on port 80

2. **api** - Node.js/Hono API server
   - Development: Nodemon with hot reload on port 3000
   - Production: Node.js server on port 3000

3. **dynamodb** - Local DynamoDB instance
   - Persistent data storage in Docker volume
   - Accessible on port 8000

4. **dynamodb-admin** - Web UI for DynamoDB
   - Optional service for viewing/managing data
   - Accessible on port 8001

5. **setup-db** - One-time setup job
   - Creates DynamoDB tables on first run
   - Exits after completion

## Docker Commands

### Development Workflow

```bash
# Start only specific services
docker-compose -f docker-compose.dev.yml up api dynamodb

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f api

# Execute commands in running container
docker-compose -f docker-compose.dev.yml exec api sh

# Clean everything (including volumes)
docker-compose -f docker-compose.dev.yml down -v
```

### Production Workflow

```bash
# Build images without starting
docker-compose build

# Start with fresh build
docker-compose up --build --force-recreate

# Scale services
docker-compose up --scale api=3

# View running containers
docker-compose ps

# Stop and remove containers but keep data
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

## Environment Variables

### API Service
- `NODE_ENV` - Environment (development/production)
- `PORT` - API server port (default: 3000)
- `AWS_REGION` - AWS region for DynamoDB (default: ap-southeast-1)
- `AWS_ACCESS_KEY_ID` - AWS access key (use "local" for local DynamoDB)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (use "local" for local DynamoDB)
- `DYNAMODB_ENDPOINT` - DynamoDB endpoint URL
- `TABLE_NAME` - DynamoDB table name

### Web Service
- `VITE_API_URL` - API base URL (development only)

## Volumes

- `dynamodb-data` - Persists DynamoDB data between container restarts
- `dynamodb-dev-data` - Separate volume for development data

## Networks

- `splitfool-network` - Production network
- `splitfool-dev-network` - Development network

## Troubleshooting

### Port Conflicts
If you see "port already in use" errors:
```bash
# Find process using port
lsof -i :3000

# Or use different ports in docker-compose.yml
ports:
  - "3001:3000"  # Map to different host port
```

### DynamoDB Connection Issues
If the API can't connect to DynamoDB:
```bash
# Check if DynamoDB is healthy
docker-compose ps

# View DynamoDB logs
docker-compose logs dynamodb

# Ensure setup-db ran successfully
docker-compose logs setup-db
```

### Permission Issues
If you encounter permission errors with volumes:
```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Or run with appropriate user in docker-compose.yml
user: "1000:1000"
```

### Building Issues
If builds fail:
```bash
# Clean Docker cache
docker system prune -a

# Build with no cache
docker-compose build --no-cache
```

## Production Deployment

For production deployment on AWS/Cloud:

1. Build and push images to a registry:
```bash
# Tag images
docker tag splitfool-api:latest your-registry/splitfool-api:latest
docker tag splitfool-web:latest your-registry/splitfool-web:latest

# Push images
docker push your-registry/splitfool-api:latest
docker push your-registry/splitfool-web:latest
```

2. Update docker-compose.yml to use real AWS DynamoDB:
- Remove `dynamodb` service
- Update `DYNAMODB_ENDPOINT` to use AWS
- Use real AWS credentials

3. Use Docker Swarm or Kubernetes for orchestration

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in development mode
2. **Debugging**: Use `docker-compose logs -f [service]` to tail logs
3. **Database GUI**: Access DynamoDB Admin at http://localhost:8001
4. **API Testing**: The API is accessible directly at http://localhost:3000
5. **Volume Mounts**: Source code is mounted, so changes are reflected immediately

## Security Notes

- The included configuration is for development/testing only
- For production:
  - Use real AWS credentials with proper IAM roles
  - Enable HTTPS/TLS
  - Use secrets management for sensitive data
  - Implement proper network isolation
  - Add rate limiting and authentication