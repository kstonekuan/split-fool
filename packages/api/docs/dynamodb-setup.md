# DynamoDB Setup Guide

This guide explains how to use AWS DynamoDB with the Split-Fool API.

## Architecture

The DynamoDB implementation uses a single-table design with the following structure:

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
AWS_REGION=us-east-1
TABLE_NAME=splitfool-local
```

For production:
```bash
AWS_REGION=us-east-1
TABLE_NAME=splitfool
# AWS credentials should be provided via IAM roles
```

## Production Deployment

### AWS Setup

1. Create DynamoDB table:
```bash
aws dynamodb create-table \
  --table-name splitfool \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=GSI1,Keys=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST \
  --billing-mode PAY_PER_REQUEST \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES \
  --region us-east-1
```

2. Enable TTL:
```bash
aws dynamodb update-time-to-live \
  --table-name splitfool \
  --time-to-live-specification Enabled=true,AttributeName=ttl \
  --region us-east-1
```

### IAM Permissions

Your Lambda function needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/splitfool",
        "arn:aws:dynamodb:*:*:table/splitfool/index/*"
      ]
    }
  ]
}
```

## Data Migration

For migrating existing data from other sources, you'll need to write a custom migration script that:
1. Reads data from your source database
2. Transforms it to match the DynamoDB schema
3. Uses the ElectroDBAdapter to write to DynamoDB

## Cost Considerations

DynamoDB pricing is based on:
- Read/Write capacity units (or on-demand pricing)
- Storage (GB-month)
- Data transfer

For Split-Fool's use case with automatic 30-day cleanup:
- Use on-demand billing for unpredictable traffic
- TTL deletes are free
- Consider reserved capacity for predictable workloads

## Monitoring

Key metrics to monitor:
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- UserErrors
- SystemErrors
- ThrottledRequests

Set up CloudWatch alarms for throttling and errors.

## Limitations

1. **No complex queries**: DynamoDB doesn't support joins or complex WHERE clauses
2. **Eventually consistent**: Default reads are eventually consistent
3. **Item size limit**: 400KB per item
4. **Query limitations**: Can only query on partition key and sort key

## Best Practices

1. **Batch operations**: Use BatchWriteItem for multiple writes
2. **Projection expressions**: Only fetch needed attributes
3. **Consistent reads**: Use sparingly as they cost 2x
4. **Error handling**: Implement exponential backoff for throttling
5. **Monitoring**: Set up proper CloudWatch metrics and alarms