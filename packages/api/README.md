# SplitFool API - AWS DynamoDB

API implementation optimized for AWS deployment with DynamoDB, with full local testing capabilities.

## Architecture

The API uses:
- **Hono** - Lightweight web framework that works on AWS Lambda
- **AWS DynamoDB** - Serverless NoSQL database
- **DynamoDB Local** - For local development and testing
- **Single-table design** - Optimized for the Split-Fool use case

## Local Development

Use Docker Compose from the project root:

```bash
# Start all services including DynamoDB Local
docker-compose -f docker-compose.dev.yml up

# API will be available at http://localhost:3000
# Web UI at http://localhost:5173
```

## Deploy to AWS Lambda

```bash
# Deploy using Terraform
./deploy.sh
```

The Terraform configuration will create:
- Lambda function with Function URL
- DynamoDB table with TTL and GSI
- IAM roles and policies
- EventBridge rule for daily cleanup
- CloudWatch alarms for monitoring

## Environment Variables

### Local Development
- `PORT` - Server port (default: 3000)
- `TABLE_NAME` - DynamoDB table name (default: splitfool-local)
- `AWS_REGION` - AWS region (default: ap-southeast-1)
- `DYNAMODB_ENDPOINT` - DynamoDB endpoint (default: http://localhost:8000)

### AWS Lambda
- `TABLE_NAME` - DynamoDB table name (set by Terraform)
- `AWS_REGION` - AWS region (default: ap-southeast-1)

## API Endpoints

- `GET /` - Health check
- `POST /api/groups` - Create a new group
- `GET /api/groups/:code` - Get group details
- `POST /api/groups/:code/members` - Add member to group
- `GET /api/groups/:code/members` - List group members
- `DELETE /api/groups/:code/members/:id` - Remove member
- `POST /api/groups/:code/expenses` - Create expense
- `GET /api/groups/:code/expenses` - List expenses
- `GET /api/groups/:code/expenses/:id/splits` - Get expense splits
- `DELETE /api/groups/:code/expenses/:id` - Delete expense

## DynamoDB Design

The API uses a single-table design with:
- **Partition Key (PK)**: `GROUP#<code>`
- **Sort Key (SK)**: Entity-specific patterns
- **Global Secondary Index (GSI1)**: For efficient expense queries
- **TTL**: Automatic 30-day cleanup
- **Provisioned billing**: 25 RCU/WCU for free tier optimization

### Key Patterns
- Groups: `PK: GROUP#<code>, SK: GROUP#INFO`
- Members: `PK: GROUP#<code>, SK: MEMBER#<memberId>`
- Expenses: `PK: GROUP#<code>, SK: EXPENSE#<expenseId>`
- Splits: `PK: GROUP#<code>, SK: SPLIT#<expenseId>#<memberId>`

## AWS Free Tier Compatibility

This implementation is optimized for AWS Free Tier:
- DynamoDB: 25 GB storage, 25 read/write capacity units
- Lambda: 1M requests, 400,000 GB-seconds per month
- Lambda Function URLs: No additional cost

The single-table design minimizes read/write operations to stay within free tier limits.

## Testing

### Unit Tests

Run unit tests for business logic calculations:

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

Unit tests focus on pure business logic without mocking:
- Expense splitting calculations
- Balance calculations
- Settlement optimization

### Integration Tests

Run the integration test with Docker:

```bash
# Start all services (DynamoDB table will be created automatically)
docker-compose -f docker-compose.dev.yml up -d

# Run the integration test
docker-compose -f docker-compose.dev.yml exec api pnpm test:integration
```

The integration test (`scripts/test.ts`) performs a comprehensive test of all database operations against DynamoDB Local.