terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"
}

# Lambda execution role
resource "aws_iam_role" "lambda_role" {
  name = "splitfool-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Attach basic execution policy
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB permissions
resource "aws_iam_role_policy" "dynamodb_policy" {
  name = "splitfool-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ]
      Resource = [
        aws_dynamodb_table.main.arn,
        "${aws_dynamodb_table.main.arn}/index/*"
      ]
    }]
  })
}

# Lambda function
resource "aws_lambda_function" "api" {
  filename         = "dist.zip"
  function_name    = "splitfool-api"
  role            = aws_iam_role.lambda_role.arn
  handler         = "lambda.handler"
  source_code_hash = filebase64sha256("dist.zip")
  runtime         = "nodejs20.x"
  memory_size     = 128
  timeout         = 30

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.main.name
      NODE_OPTIONS = "--enable-source-maps"
    }
  }
}

# Cleanup Lambda function
resource "aws_lambda_function" "cleanup" {
  filename         = "dist.zip"
  function_name    = "splitfool-cleanup"
  role            = aws_iam_role.lambda_role.arn
  handler         = "cleanup.handler"
  source_code_hash = filebase64sha256("dist.zip")
  runtime         = "nodejs20.x"
  memory_size     = 128
  timeout         = 60

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.main.name
    }
  }
}

# Lambda Function URL
resource "aws_lambda_function_url" "api_url" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
    max_age       = 86400
  }
}

# DynamoDB table
resource "aws_dynamodb_table" "main" {
  name           = "splitfool-table"
  billing_mode   = "PROVISIONED"
  read_capacity  = 25
  write_capacity = 25
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    write_capacity  = 25
    read_capacity   = 25
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}

# EventBridge rule for daily cleanup
resource "aws_cloudwatch_event_rule" "daily_cleanup" {
  name                = "splitfool-daily-cleanup"
  description         = "Trigger cleanup of old groups"
  schedule_expression = "rate(1 day)"
}

resource "aws_cloudwatch_event_target" "cleanup_lambda" {
  rule      = aws_cloudwatch_event_rule.daily_cleanup.name
  target_id = "CleanupLambdaTarget"
  arn       = aws_lambda_function.cleanup.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cleanup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_cleanup.arn
}

# CloudWatch Alarms
# Note: Monitoring daily usage instead of monthly due to CloudWatch limitations
# 1k invocations/day * 30 days = 30,000/month (under 1M free tier)
resource "aws_cloudwatch_metric_alarm" "lambda_invocations" {
  alarm_name          = "splitfool-lambda-invocations-daily"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Invocations"
  namespace           = "AWS/Lambda"
  period              = "86400"    # 24 hours
  statistic           = "Sum"
  threshold           = "1000"    # ~1k/day to stay under 1M/month
  alarm_description   = "Alert when daily Lambda invocations exceed 30k (to stay under 1M/month free tier)"

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "dynamodb_read_capacity" {
  alarm_name          = "splitfool-dynamodb-read-capacity"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ConsumedReadCapacityUnits"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "20"  # 80% of 25 RCU
  alarm_description   = "Alert when DynamoDB read capacity usage is high"

  dimensions = {
    TableName = aws_dynamodb_table.main.name
  }
}

# Outputs
output "function_url" {
  value = aws_lambda_function_url.api_url.function_url
  description = "The Lambda Function URL"
}

output "table_name" {
  value = aws_dynamodb_table.main.name
  description = "The DynamoDB table name"
}