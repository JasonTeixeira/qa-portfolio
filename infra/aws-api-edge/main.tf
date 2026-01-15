terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# CloudFront + WAF require ACM certs in us-east-1.
provider "aws" {
  region = "us-east-1"
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

data "aws_caller_identity" "current" {}

locals {
  logs_bucket_name = "${local.name_prefix}-cloudfront-logs-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket" "cloudfront_logs" {
  bucket        = local.logs_bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_ownership_controls" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_policy" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontLogs"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = ["s3:PutObject"]
        Resource = "${aws_s3_bucket.cloudfront_logs.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.api_edge.arn
          }
        }
      },
    ]
  })
}

# ACM cert for CloudFront
resource "aws_acm_certificate" "api_edge" {
  domain_name       = var.api_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "api_edge_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_edge.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60

  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "api_edge" {
  certificate_arn         = aws_acm_certificate.api_edge.arn
  validation_record_fqdns = [for r in aws_route53_record.api_edge_cert_validation : r.fqdn]
}

# WAF at the edge (CLOUDFRONT scope)
resource "aws_wafv2_web_acl" "api_edge" {
  name        = "${local.name_prefix}-api-edge-waf"
  description = "Edge WAF for API CloudFront"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.name_prefix}-api-edge-waf"
    sampled_requests_enabled   = true
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "RateLimit2000Per5Min"
    priority = 2

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimit2000Per5Min"
      sampled_requests_enabled   = true
    }
  }
}

resource "aws_cloudfront_distribution" "api_edge" {
  enabled             = true
  comment             = "${local.name_prefix} API edge (CloudFront -> API Gateway)"
  default_root_object = ""
  price_class         = "PriceClass_100"

  aliases = [var.api_domain_name]

  logging_config {
    bucket          = aws_s3_bucket.cloudfront_logs.bucket_domain_name
    include_cookies = false
    prefix          = "api-edge/"
  }

  origin {
    domain_name = var.origin_api_gateway_domain
    origin_id   = "apigw"
    origin_path = "/${var.origin_stage_name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "apigw"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"]
    cached_methods  = ["GET", "HEAD", "OPTIONS"]

    compress = true

    # We want this to behave like an API proxy, not a cache.
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0

    # Cache policy is required when attaching an origin request policy.
    cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api_forward_all.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.api_edge.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  web_acl_id = aws_wafv2_web_acl.api_edge.arn
}

resource "aws_cloudfront_cache_policy" "api_no_cache" {
  name        = "${local.name_prefix}-api-no-cache"
  comment     = "Disable caching for API behavior"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = false
    enable_accept_encoding_gzip   = false

    # With caching disabled, CloudFront won't allow cookies in the cache key.
    # Cookies can still be forwarded via the origin request policy.
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_origin_request_policy" "api_forward_all" {
  name    = "${local.name_prefix}-api-forward-all"
  comment = "Forward all query strings/cookies + basic CORS headers to API Gateway"

  cookies_config {
    cookie_behavior = "all"
  }

  headers_config {
    header_behavior = "whitelist"
    headers {
      items = [
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
      ]
    }
  }

  query_strings_config {
    query_string_behavior = "all"
  }
}

resource "aws_route53_record" "api_alias_a" {
  zone_id = var.hosted_zone_id
  name    = var.api_domain_name
  type    = "A"

  allow_overwrite = true

  alias {
    name                   = aws_cloudfront_distribution.api_edge.domain_name
    zone_id                = aws_cloudfront_distribution.api_edge.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_alias_aaaa" {
  zone_id = var.hosted_zone_id
  name    = var.api_domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.api_edge.domain_name
    zone_id                = aws_cloudfront_distribution.api_edge.hosted_zone_id
    evaluate_target_health = false
  }
}
