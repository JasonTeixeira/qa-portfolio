output "api_base_url" {
  value       = "https://${aws_apigatewayv2_domain_name.api.domain_name}"
  description = "Public API base URL (custom domain)."
}

output "newsletter_table_name" {
  value       = aws_dynamodb_table.newsletter.name
  description = "DynamoDB table name for newsletter subscribers."
}

