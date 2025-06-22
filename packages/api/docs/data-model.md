# SplitFool Data Model

## DynamoDB Single-Table Design

### Primary Key Structure
- **Partition Key (PK)**: `GROUP#<code>`
- **Sort Key (SK)**:
  - `GROUP#INFO` - Group metadata
  - `MEMBER#<memberId>` - Member records
  - `EXPENSE#<expenseId>` - Expense records
  - `SPLIT#<expenseId>#<memberId>` - Expense split records

### Global Secondary Index (GSI1)
- **GSI1PK**: `EXPENSE#<expenseId>`
- **GSI1SK**: `EXPENSE#INFO` or `SPLIT#<memberId>`

This allows efficient querying of expenses and their splits.

### TTL (Time To Live)
Groups are automatically deleted after 30 days using DynamoDB's TTL feature on the `ttl` attribute.

## Local Development

### Prerequisites
- Docker and Docker Compose
- Node.js 20+
- pnpm

### Setup

1. Start DynamoDB Local:
```bash
pnpm dynamodb:start
```

This starts:
- DynamoDB Local on port 8000
- DynamoDB Admin UI on port 8001 (http://localhost:8001)

2. Create the table:
```bash
pnpm dynamodb:setup
```

3. Run the API with DynamoDB:
```bash
pnpm dev:dynamodb
```

The API will be available at http://localhost:3000

### Environment Variables

For local development:
```bash
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=ap-southeast-1
TABLE_NAME=splitfool-local
```

## Production Infrastructure

All production infrastructure is managed by Terraform. See `/packages/api/main.tf` for the complete configuration.