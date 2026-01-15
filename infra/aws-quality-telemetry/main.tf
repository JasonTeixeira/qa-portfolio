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

resource "aws_s3_bucket" "metrics" {
  bucket = var.s3_bucket_name != "" ? var.s3_bucket_name : "${local.name_prefix}-qa-metrics"
}

resource "aws_s3_bucket_public_access_block" "metrics" {
  bucket                  = aws_s3_bucket.metrics.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "metrics" {
  bucket = aws_s3_bucket.metrics.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "metrics" {
  bucket = aws_s3_bucket.metrics.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "metrics" {
  count  = var.s3_retention_days > 0 ? 1 : 0
  bucket = aws_s3_bucket.metrics.id

  rule {
    id     = "expire-metrics"
    status = "Enabled"

    filter {
      prefix = "${trim(var.s3_prefix, "/")}/"
    }

    expiration {
      days = var.s3_retention_days
    }
  }
}

resource "aws_dynamodb_table" "metrics_index" {
  count        = var.enable_dynamodb ? 1 : 0
  name         = "${local.name_prefix}-qa-metrics"
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
}

// GitHub OIDC provider (one per AWS account)
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  // GitHub uses rotating certs; AWS docs recommend pinning the thumbprint.
  // This value is commonly used for token.actions.githubusercontent.com.
  // If AWS rejects it, re-compute from the GitHub OIDC cert chain.
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_policy_document" "github_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [for r in var.github_repositories : "repo:${r}:*"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "github_writer" {
  name               = "${local.name_prefix}-github-qa-metrics-writer"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}

data "aws_iam_policy_document" "writer" {
  statement {
    sid     = "WriteMetricsToS3"
    effect  = "Allow"
    actions = ["s3:PutObject", "s3:AbortMultipartUpload"]
    resources = [
      "${aws_s3_bucket.metrics.arn}/${trim(var.s3_prefix, "/")}/*",
    ]
  }

  statement {
    sid     = "ListBucketPrefix"
    effect  = "Allow"
    actions = ["s3:ListBucket"]
    resources = [
      aws_s3_bucket.metrics.arn,
    ]
    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values   = ["${trim(var.s3_prefix, "/")}/*"]
    }
  }

  dynamic "statement" {
    for_each = var.enable_dynamodb ? [1] : []
    content {
      sid     = "WriteIndexToDynamo"
      effect  = "Allow"
      actions = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
      resources = [
        aws_dynamodb_table.metrics_index[0].arn,
      ]
    }
  }
}

resource "aws_iam_role_policy" "github_writer" {
  name   = "${local.name_prefix}-writer"
  role   = aws_iam_role.github_writer.id
  policy = data.aws_iam_policy_document.writer.json
}
