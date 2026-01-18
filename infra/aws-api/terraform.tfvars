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

# Required for GET /metrics/latest (sent as x-metrics-token)
metrics_shared_token = "d89fd7ea3f51a40f8d9560819a268d102ebf1dc32f3459693d7d26c79ca49bd7"
