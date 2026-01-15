output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.api_edge.domain_name
  description = "The CloudFront distribution domain name."
}

output "api_hostname" {
  value       = var.api_domain_name
  description = "Public API hostname (points to CloudFront)."
}

