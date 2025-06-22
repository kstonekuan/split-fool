#!/bin/bash

set -e

echo "Building AWS Lambda deployment..."

# Install dependencies
pnpm install

# Build TypeScript
pnpm run build:aws

# Copy handler file to dist
cp dist/lambda.js dist/index.js

# Build and deploy with SAM
sam build
sam deploy --guided