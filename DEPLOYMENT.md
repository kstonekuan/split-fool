# SplitFool Deployment Guide

## AWS Lambda Deployment

### Prerequisites
1. AWS Account (Free Tier eligible)
2. AWS CLI installed and configured
3. SAM CLI installed
4. Node.js 20.x and pnpm

### Step 1: Build the Shared Package
```bash
cd packages/shared
pnpm install
pnpm build
```

### Step 2: Deploy the AWS Lambda API
```bash
cd packages/api
pnpm install
pnpm build

# First deployment (interactive)
sam deploy --guided

# Follow the prompts:
# - Stack Name: splitfool
# - AWS Region: us-east-1 (or your preferred region)
# - Confirm changes before deploy: Y
# - Allow SAM to create IAM roles: Y
```

### Step 3: Deploy the Frontend to Cloudflare Pages (Free Forever)

#### Option 1: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `pnpm install && pnpm build`
   - Build output directory: `dist`
   - Root directory: `packages/web`
5. Add environment variable:
   - `VITE_API_URL`: Your AWS API Gateway URL from Step 2

#### Option 2: GitHub Actions (Automated)
1. Add secrets to your GitHub repository:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
2. Add repository variable:
   - `VITE_API_URL`: Your AWS API Gateway URL from Step 2
3. Push to main branch (deployment triggers automatically)

#### Option 3: Manual Deployment
```bash
cd packages/web
# Set the API URL
echo "VITE_API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod" > .env.production

# Build and deploy
pnpm install
pnpm deploy:cf
```


## Cost Estimates

### AWS (Free Tier)
- Lambda: 1M requests/month (always free)
- API Gateway: 1M API calls/month (always free)
- DynamoDB: 25GB storage (always free)
- CloudWatch: 5GB logs (always free)

### Cloudflare Pages (Frontend)
- Bandwidth: Unlimited (always free)
- Builds: 500/month (always free)
- Concurrent builds: 1 (always free)
- Custom domains: Unlimited (always free)
- SSL certificates: Automatic (always free)

## Monitoring

### CloudWatch Dashboard
1. Navigate to CloudWatch Console
2. Create dashboard with:
   - Lambda invocations
   - API Gateway requests
   - DynamoDB consumed capacity
   - Error rates

### X-Ray Tracing
1. Enable in Lambda console
2. View service map for request flow
3. Analyze latency bottlenecks

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify API Gateway CORS configuration
   - Check frontend API URL configuration

2. **Lambda Timeouts**
   - Increase timeout in template.yaml
   - Check CloudWatch logs for errors

3. **DynamoDB Throttling**
   - Switch to on-demand billing
   - Implement exponential backoff

### Debug Commands
```bash
# View Lambda logs
sam logs -n CreateGroupFunction --tail

# Test API locally
sam local start-api

# Validate template
sam validate
```

## Security Best Practices

1. **API Gateway**
   - Enable request validation
   - Set up usage plans and API keys
   - Configure WAF rules

2. **Lambda**
   - Use least-privilege IAM roles
   - Enable reserved concurrency
   - Set up Dead Letter Queues

3. **DynamoDB**
   - Enable point-in-time recovery
   - Configure VPC endpoints
   - Use encryption at rest

## Performance Optimization

1. **Lambda**
   - Use provisioned concurrency for critical functions
   - Optimize bundle size
   - Enable Lambda SnapStart

2. **API Gateway**
   - Enable caching
   - Use CloudFront distribution
   - Implement request throttling

3. **DynamoDB**
   - Use projection expressions
   - Implement pagination
   - Optimize GSI usage