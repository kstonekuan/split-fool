# SplitFool Deployment Guide

## Architecture

### AWS Lambda (Backend)
- Lambda Function URL → Lambda → DynamoDB
- Single function handling all routes (no API Gateway needed!)
- ElectroDB for type-safe DynamoDB access
- Automatic group cleanup after 30 days
- **Permanently free** with Lambda Function URLs
- **Zero S3 usage** with Terraform deployment

### Cloudflare Pages (Frontend)
- SvelteKit static adapter
- GitHub integration for auto-deployment
- Custom domain support

## AWS Lambda Deployment

### Prerequisites
1. AWS Account (Free Tier eligible)
2. AWS CLI installed and configured
3. Terraform installed (https://www.terraform.io/downloads)
4. Node.js 20.x and pnpm
5. jq (for JSON parsing, optional)

### Step 1: Build the Shared Package
```bash
cd packages/shared
pnpm install
pnpm build
```

### Step 2: Deploy the AWS Lambda API with Terraform

```bash
cd packages/api

# Deploy everything with one command
./deploy.sh
```

This will:
1. Build the TypeScript code
2. Create a deployment package
3. Initialize Terraform
4. Deploy Lambda functions, DynamoDB table, and all resources
5. Output the Lambda Function URL

**No S3 buckets are created or used!**

For manual deployment:
```bash
# Build the project
pnpm install && pnpm build

# Create deployment package
cd dist && zip -r ../dist.zip . && cd ..

# Deploy with Terraform
terraform init
terraform apply
```

### Step 3: Deploy the Frontend to Cloudflare Pages (Free Forever)

#### Deploy via Cloudflare Dashboard
1. Push your code to GitHub
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
3. Click "Create application" → "Connect to Git"
4. Select your GitHub repository
5. Configure build settings:
   - Framework preset: `None`
   - Build command: `pnpm install && pnpm build`
   - Build output directory: `packages/web/dist`
   - Root directory: `packages/web`
6. Add environment variable:
   - Variable name: `VITE_API_URL`
   - Value: Your Lambda Function URL from Step 2 (shown in deployment output)
   - Example: `https://xxxxxxxxxxxxx.lambda-url.ap-southeast-1.on.aws/`
7. Click "Save and Deploy"

Cloudflare will automatically redeploy when you push to your main branch.

#### Manual Deployment (Alternative)
```bash
cd packages/web
# Set the API URL
echo "VITE_API_URL=https://xxxxxxxxxxxxx.lambda-url.ap-southeast-1.on.aws/" > .env.production

# Build and deploy
pnpm install
pnpm deploy:cf
```


## Cost Estimates

### AWS (Permanently Free Tier)
- Lambda: 1M requests/month (always free)
- Lambda Function URLs: No additional cost (included with Lambda)
- DynamoDB: 25GB storage, 25 RCU/WCU (always free)
- CloudWatch: 5GB logs (always free)
- **S3: Not used at all with Terraform deployment**

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
   - Lambda Function URL requests
   - DynamoDB consumed capacity
   - Error rates

### X-Ray Tracing (Optional - has costs)
1. Only enable if needed for debugging
2. View service map for request flow
3. Analyze latency bottlenecks
4. Disable after debugging to avoid charges

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Lambda Function URLs have CORS configured in main.tf
   - Check the cors block in aws_lambda_function_url resource
   - Verify frontend VITE_API_URL environment variable

2. **Lambda Timeouts**
   - Increase timeout in main.tf (aws_lambda_function timeout)
   - Check CloudWatch logs for errors

3. **DynamoDB Throttling**
   - Increase read_capacity/write_capacity in main.tf
   - Or switch to on-demand billing mode

### Debug Commands
```bash
# View Lambda logs
aws logs tail /aws/lambda/splitfool-api --follow

# View Terraform state
terraform show

# Destroy and recreate if needed
terraform destroy
terraform apply
```

### Terraform Management
```bash
# Update infrastructure after changes
terraform plan
terraform apply

# Remove all resources
terraform destroy
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