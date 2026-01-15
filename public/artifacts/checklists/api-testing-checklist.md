# API Testing Checklist

## Contract & schema
- [ ] Schema validation (OpenAPI/Pydantic)
- [ ] Backward compatible changes

## Auth & authorization
- [ ] Auth required where appropriate
- [ ] Role-based access checks

## Negative testing
- [ ] Invalid payloads
- [ ] Missing required fields
- [ ] Boundary values

## Reliability
- [ ] Idempotency
- [ ] Retries for transient failures
- [ ] Rate limiting behavior (429)

## Data
- [ ] Pagination
- [ ] Sorting/filtering
- [ ] Consistency across endpoints
