output "newsletter_table_name" {
  value       = aws_dynamodb_table.newsletter.name
  description = "DynamoDB table name for newsletter subscribers."
}

output "newsletter_table_arn" {
  value       = aws_dynamodb_table.newsletter.arn
  description = "DynamoDB table ARN for newsletter subscribers."
}

output "rate_limit_table_name" {
  value       = var.enable_rate_limit_table ? aws_dynamodb_table.rate_limit[0].name : null
  description = "DynamoDB table name for distributed rate limiting (optional)."
}

output "runtime_policy_arn" {
  value       = aws_iam_policy.runtime.arn
  description = "IAM policy ARN to attach to the app runtime role/user (Vercel/AWS)."
}
