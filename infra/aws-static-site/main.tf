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

# ACM cert for CloudFront must be in us-east-1
provider "aws" {
  alias  = "use1"
  region = "us-east-1"
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  apex        = var.domain_name
  www         = "www.${var.domain_name}"
  aliases     = var.include_www ? [local.apex, local.www] : [local.apex]
  site_bucket = "${local.name_prefix}-${replace(var.domain_name, ".", "-")}-site"
  www_bucket  = "${local.name_prefix}-${replace(var.domain_name, ".", "-")}-www"
  origin_id   = "s3-origin-${local.site_bucket}"
}

resource "aws_route53_zone" "public" {
  name = local.apex
}

# Site bucket (private; CloudFront OAC reads)
resource "aws_s3_bucket" "site" {
  bucket = local.site_bucket
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

# Optional www redirect bucket (public website redirect)
resource "aws_s3_bucket" "www" {
  count  = var.include_www ? 1 : 0
  bucket = local.www_bucket
}

resource "aws_s3_bucket_website_configuration" "www" {
  count  = var.include_www ? 1 : 0
  bucket = aws_s3_bucket.www[0].id

  redirect_all_requests_to {
    host_name = local.apex
    protocol  = "https"
  }
}

resource "aws_s3_bucket_public_access_block" "www" {
  count                   = var.include_www ? 1 : 0
  bucket                  = aws_s3_bucket.www[0].id
  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "www_public" {
  count = var.include_www ? 1 : 0
  statement {
    sid     = "PublicReadForRedirect"
    effect  = "Allow"
    actions = ["s3:GetObject"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    resources = ["${aws_s3_bucket.www[0].arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "www_public" {
  count  = var.include_www ? 1 : 0
  bucket = aws_s3_bucket.www[0].id
  policy = data.aws_iam_policy_document.www_public[0].json
}

# ACM certificate (DNS validation)
resource "aws_acm_certificate" "cert" {
  provider                  = aws.use1
  domain_name               = local.apex
  validation_method         = "DNS"
  subject_alternative_names = var.include_www ? [local.www] : []

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.public.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.use1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# CloudFront OAC for private S3
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${local.name_prefix}-oac"
  description                       = "OAC for ${local.site_bucket}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_distribution" "existing" {
  count = var.existing_cloudfront_distribution_id == "" ? 0 : 1

  # If these aliases already exist in the account, re-use that distribution
  id = var.existing_cloudfront_distribution_id
}

resource "aws_cloudfront_distribution" "apex" {
  count               = var.existing_cloudfront_distribution_id == "" ? 1 : 0
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${local.name_prefix} static site"
  default_root_object = "index.html"

  aliases = local.aliases

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = local.origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.origin_id

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cert.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  price_class = "PriceClass_100"

  depends_on = [aws_acm_certificate_validation.cert]
}

data "aws_iam_policy_document" "site_bucket" {
  statement {
    sid       = "AllowCloudFrontRead"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = var.existing_cloudfront_distribution_id == "" ? [aws_cloudfront_distribution.apex[0].arn] : [data.aws_cloudfront_distribution.existing[0].arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site_bucket.json
}

# Route53 aliases
resource "aws_route53_record" "apex_a" {
  zone_id = aws_route53_zone.public.zone_id
  name    = local.apex
  type    = "A"
  alias {
    name                   = var.existing_cloudfront_distribution_id == "" ? aws_cloudfront_distribution.apex[0].domain_name : data.aws_cloudfront_distribution.existing[0].domain_name
    zone_id                = var.existing_cloudfront_distribution_id == "" ? aws_cloudfront_distribution.apex[0].hosted_zone_id : data.aws_cloudfront_distribution.existing[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  zone_id = aws_route53_zone.public.zone_id
  name    = local.apex
  type    = "AAAA"
  alias {
    name                   = var.existing_cloudfront_distribution_id == "" ? aws_cloudfront_distribution.apex[0].domain_name : data.aws_cloudfront_distribution.existing[0].domain_name
    zone_id                = var.existing_cloudfront_distribution_id == "" ? aws_cloudfront_distribution.apex[0].hosted_zone_id : data.aws_cloudfront_distribution.existing[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_a" {
  count   = var.include_www ? 1 : 0
  zone_id = aws_route53_zone.public.zone_id
  name    = local.www
  type    = "A"
  alias {
    name                   = var.existing_cloudfront_distribution_id == "" ? aws_cloudfront_distribution.apex[0].domain_name : data.aws_cloudfront_distribution.existing[0].domain_name
    zone_id                = var.existing_cloudfront_distribution_id == "" ? aws_cloudfront_distribution.apex[0].hosted_zone_id : data.aws_cloudfront_distribution.existing[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_aaaa" {
  count   = var.include_www ? 1 : 0
  zone_id = aws_route53_zone.public.zone_id
  name    = local.www
  type    = "AAAA"
  alias {
    name                   = var.existing_cloudfront_distribution_id == "" ? aws_cloudfront_distribution.apex[0].domain_name : data.aws_cloudfront_distribution.existing[0].domain_name
    zone_id                = var.existing_cloudfront_distribution_id == "" ? aws_cloudfront_distribution.apex[0].hosted_zone_id : data.aws_cloudfront_distribution.existing[0].hosted_zone_id
    evaluate_target_health = false
  }
}
