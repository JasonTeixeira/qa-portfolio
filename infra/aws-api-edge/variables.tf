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

variable "hosted_zone_id" {
  description = "Route53 hosted zone id for sageideas.dev (e.g. Z0426...)."
  type        = string
}

variable "api_domain_name" {
  description = "Public API hostname (will point to CloudFront)."
  type        = string
  default     = "api.sageideas.dev"
}

variable "origin_api_gateway_domain" {
  description = "API Gateway execute-api domain (no scheme). Example: rxyixiywic.execute-api.us-east-1.amazonaws.com"
  type        = string
}

variable "origin_stage_name" {
  description = "API Gateway stage name (used as CloudFront origin path)."
  type        = string
  default     = "prod"
}

