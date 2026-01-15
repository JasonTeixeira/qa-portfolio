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
  description = "AWS region (Lambda + DynamoDB + API Gateway)."
  type        = string
  default     = "us-east-1"
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone id for sageideas.dev (e.g. Z0426...)."
  type        = string
}

variable "api_domain_name" {
  description = "Custom domain for API Gateway."
  type        = string
  default     = "api.sageideas.dev"
}

variable "site_url" {
  description = "Public site URL used for redirects (confirm/unsubscribe)."
  type        = string
  default     = "https://sageideas.dev"
}

variable "ses_from_email" {
  description = "From address for SES sending. Must be verified in SES."
  type        = string
  default     = "sage@sageideas.org"
}

variable "contact_to_email" {
  description = "Where contact form submissions should be delivered."
  type        = string
  default     = "sage@sageideas.org"
}

variable "alarm_email" {
  description = "Email address to subscribe to SNS alarm notifications."
  type        = string
  default     = "sage@sageideas.org"
}
