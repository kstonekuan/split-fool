#!/bin/bash
# Deploy SplitFool API using Terraform

set -e

echo "🚀 SplitFool Terraform Deployment"
echo "================================="

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install it from https://www.terraform.io/downloads"
    exit 1
fi

# Build the project
echo "📦 Building the API..."
pnpm install
pnpm build

# Create deployment package
echo "📦 Creating deployment package..."
cd dist
zip -r ../dist.zip . > /dev/null
cd ..

# Initialize Terraform
echo "🔧 Initializing Terraform..."
terraform init

# Plan the deployment
echo "📋 Planning deployment..."
terraform plan -out=tfplan

# Apply the deployment
echo "🚀 Deploying to AWS..."
terraform apply tfplan

# Get outputs
echo ""
echo "✅ Deployment complete!"
echo "================================="
terraform output -json | jq -r 'to_entries[] | "\\(.key): \\(.value.value)"'

# Clean up
rm tfplan
rm dist.zip

echo ""
echo "📝 Next steps:"
echo "1. Copy the function_url above"
echo "2. Add it to Cloudflare Pages as VITE_API_URL environment variable"