project_name       = "qa-portfolio"
environment        = "dev"
aws_region         = "us-east-1"

# Senior-signal option (still low cost with small data + on-demand)
enable_dynamodb    = true
s3_retention_days  = 30

# IMPORTANT: list every repo that will upload qa-metrics.json
github_repositories = [
  "JasonTeixeira/qa-portfolio"
]

