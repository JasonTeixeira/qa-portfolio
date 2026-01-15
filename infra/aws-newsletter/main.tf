terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "aws_dynamodb_table" "newsletter" {
  name         = "${local.name_prefix}-newsletter"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

# Optional: DynamoDB-backed rate limiting (shared across instances)
resource "aws_dynamodb_table" "rate_limit" {
  count        = var.enable_rate_limit_table ? 1 : 0
  name         = "${local.name_prefix}-rate-limit"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

# IAM policy document for the app runtime (Next.js) to access DynamoDB + SES
data "aws_iam_policy_document" "runtime" {
  statement {
    sid    = "NewsletterDynamoAccess"
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:GetItem",
      "dynamodb:Query",
    ]
    resources = [aws_dynamodb_table.newsletter.arn]
  }

  dynamic "statement" {
    for_each = var.enable_rate_limit_table ? [1] : []
    content {
      sid    = "RateLimitDynamoAccess"
      effect = "Allow"
      actions = [
        "dynamodb:UpdateItem",
        "dynamodb:GetItem",
      ]
      resources = [aws_dynamodb_table.rate_limit[0].arn]
    }
  }

  statement {
    sid       = "SendEmailSES"
    effect    = "Allow"
    actions   = ["ses:SendEmail", "ses:SendRawEmail"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "runtime" {
  name        = "${local.name_prefix}-newsletter-runtime"
  description = "Least-privilege policy for qa-portfolio newsletter/contact runtime"
  policy      = data.aws_iam_policy_document.runtime.json
}
