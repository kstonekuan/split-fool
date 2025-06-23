# SplitFool API

AWS Lambda API with DynamoDB for expense splitting.

## Quick Start

```bash
# Local development
docker-compose -f docker-compose.dev.yml up

# Deploy to AWS
pnpm deploy:aws
```

## Architecture

- **Hono**: Lightweight web framework
- **DynamoDB**: Single-table design with GSI
- **Lambda**: 512 MB memory, Function URL
- **Deployment**: esbuild bundling + Terraform

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:code` | Get group details |
| POST | `/api/groups/:code/members` | Add member |
| GET | `/api/groups/:code/members` | List members |
| DELETE | `/api/groups/:code/members/:id` | Remove member |
| POST | `/api/groups/:code/expenses` | Create expense |
| GET | `/api/groups/:code/expenses` | List expenses |
| GET | `/api/groups/:code/expenses/:id/splits` | Get splits |
| DELETE | `/api/groups/:code/expenses/:id` | Delete expense |

## DynamoDB Schema

Single-table design with composite keys:

| Entity | PK | SK |
|--------|----|----|
| Group | `GROUP#<code>` | `GROUP#INFO` |
| Member | `GROUP#<code>` | `MEMBER#<id>` |
| Expense | `GROUP#<code>` | `EXPENSE#<id>` |
| Split | `GROUP#<code>` | `SPLIT#<expenseId>#<memberId>` |

- **GSI1**: For expense queries (`GSI1PK: GROUP#<code>`, `GSI1SK: EXPENSE#<timestamp>`)
- **TTL**: 30-day auto-cleanup
- **Capacity**: 25 RCU/WCU (free tier)

## AWS Free Tier Usage

- **Lambda**: 1M requests + 400k GB-seconds/month
  - 512 MB = ~800k seconds = ~50k requests/day
- **DynamoDB**: 25 GB + 25 RCU/WCU
- **CloudWatch**: 5 GB logs

## Testing

```bash
# Unit tests (calculations, no mocks)
pnpm test

# Integration test (requires Docker)
docker-compose -f docker-compose.dev.yml exec api pnpm test:integration
```

## Environment Variables

**Local**: `PORT`, `TABLE_NAME`, `AWS_REGION`, `DYNAMODB_ENDPOINT`  
**Lambda**: `TABLE_NAME`, `AWS_REGION` (set by Terraform)