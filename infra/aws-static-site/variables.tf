variable "project_name" {
  description = "Short project name used for resource naming."
  type        = string
  default     = "qa-portfolio"
}

variable "environment" {
  description = "Environment name (dev/stage/prod)."
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for S3/Route53 (CloudFront is global)."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Root domain name (apex)."
  type        = string
  default     = "sageideas.dev"
}

variable "include_www" {
  description = "If true, provision www.<domain_name>"
  type        = bool
  default     = true
}

variable "existing_cloudfront_distribution_id" {
  description = "If set, reuse an existing CloudFront distribution (avoids CNAMEAlreadyExists)."
  type        = string
  default     = ""
}
