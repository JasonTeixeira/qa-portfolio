variable "project_name" {
  description = "Short project name used for resource naming."
  type        = string
  default     = "qa-portfolio"
}

variable "environment" {
  description = "Environment name (dev/stage/prod)."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

variable "enable_rate_limit_table" {
  description = "If true, create a DynamoDB table used for distributed rate limiting across instances."
  type        = bool
  default     = true
}
