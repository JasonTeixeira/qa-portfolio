output "s3_bucket_name" {
  value       = aws_s3_bucket.metrics.bucket
  description = "Bucket where qa-metrics.json is uploaded."
}

output "dynamodb_table_name" {
  value       = var.enable_dynamodb ? aws_dynamodb_table.metrics_index[0].name : null
  description = "DynamoDB table for indexing/querying metrics."
}

output "github_writer_role_arn" {
  value       = aws_iam_role.github_writer.arn
  description = "IAM role that GitHub Actions can assume via OIDC to write metrics."
}
