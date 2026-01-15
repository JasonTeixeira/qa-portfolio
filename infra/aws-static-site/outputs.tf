output "hosted_zone_id" {
  value       = aws_route53_zone.public.zone_id
  description = "Route53 hosted zone ID."
}

output "nameservers" {
  value       = aws_route53_zone.public.name_servers
  description = "Set these as the domain's nameservers at Namecheap."
}

output "cloudfront_domain" {
  value       = var.existing_cloudfront_distribution_id == "" ? aws_cloudfront_distribution.apex[0].domain_name : data.aws_cloudfront_distribution.existing[0].domain_name
  description = "CloudFront distribution domain name."
}

output "site_bucket" {
  value       = aws_s3_bucket.site.bucket
  description = "S3 bucket name for the static site."
}
