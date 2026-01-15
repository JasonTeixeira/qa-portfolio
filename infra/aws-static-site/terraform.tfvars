# Domain is registered at Namecheap; this module creates Route53 DNS + CloudFront/S3 hosting.
domain_name = "sageideas.dev"
include_www = true

# We detected these aliases already exist on an existing CloudFront distribution.
# Reuse it instead of trying to create a new one.
existing_cloudfront_distribution_id = "ECYP1K6STF40R"

