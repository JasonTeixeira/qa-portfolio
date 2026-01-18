project_name   = "qa-portfolio"
environment    = "prod"
aws_region     = "us-east-1"
hosted_zone_id = "Z0426642BJYTEQDR29LE"

api_domain_name  = "api.sageideas.dev"
site_url         = "https://sageideas.dev"
ses_from_email   = "sage@sageideas.org"
contact_to_email = "sage@sageideas.org"
alarm_email      = "sage@sageideas.org"

# Telemetry proxy (read-only)
metrics_bucket = "qa-portfolio-dev-qa-metrics"
metrics_key    = "metrics/qa-portfolio/latest.json"

# Optional. Leave empty to make endpoint public.
metrics_shared_token = ""
