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

variable "s3_bucket_name" {
  description = "Optional explicit bucket name. If empty, a name will be derived from project/env."
  type        = string
  default     = ""
}

variable "s3_prefix" {
  description = "Prefix within the bucket where metrics are written."
  type        = string
  default     = "metrics"
}

variable "enable_dynamodb" {
  description = "If true, create DynamoDB indexing table. Keep false for lowest cost / simplest deployment."
  type        = bool
  default     = false
}

variable "s3_retention_days" {
  description = "Retention for metrics objects in S3. 0 disables lifecycle expiration."
  type        = number
  default     = 30
}

variable "github_repositories" {
  description = "List of GitHub repositories allowed to assume the writer role. Format: owner/repo"
  type        = list(string)
  default     = ["JasonTeixeira/qa-portfolio"]
}
