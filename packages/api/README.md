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
# Build the Lambda bundle
pnpm build:aws

# Deploy using AWS SAM
sam build
sam deploy --guided
```

The SAM template will create:
- API Gateway
- Lambda function
- DynamoDB table with TTL
- Scheduled cleanup function

## Environment Variables

### Local Development
- `PORT` - Server port (default: 3000)
- `TABLE_NAME` - DynamoDB table name (default: splitfool-local)
- `AWS_REGION` - AWS region (default: us-east-1)
- `DYNAMODB_ENDPOINT` - DynamoDB endpoint (default: http://localhost:8000)

### AWS Lambda
- `TABLE_NAME` - DynamoDB table name (set by SAM template)
- `AWS_REGION` - AWS region (set by Lambda runtime)

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
- **Global Secondary Index**: For efficient expense queries
- **TTL**: Automatic 30-day cleanup
- **Pay-per-request billing**: No capacity planning needed

### Key Patterns
- Groups: `PK: GROUP#<code>, SK: GROUP#INFO`
- Members: `PK: GROUP#<code>, SK: MEMBER#<memberId>`
- Expenses: `PK: GROUP#<code>, SK: EXPENSE#<expenseId>`
- Splits: `PK: GROUP#<code>, SK: SPLIT#<expenseId>#<memberId>`

## AWS Free Tier Compatibility

This implementation is optimized for AWS Free Tier:
- DynamoDB: 25 GB storage, 25 read/write capacity units
- Lambda: 1M requests, 400,000 GB-seconds per month
- API Gateway: 1M API calls per month

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