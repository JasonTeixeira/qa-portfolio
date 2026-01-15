# Security Testing Checklist (OWASP-focused)

## Auth
- [ ] MFA / password policy (if applicable)
- [ ] Session expiration
- [ ] Brute-force protection

## Authorization
- [ ] Broken access control checks
- [ ] Privilege escalation attempts

## Injection
- [ ] SQL/NoSQL injection probes
- [ ] Command injection probes

## XSS / output encoding
- [ ] Reflected/stored XSS probes

## Secrets
- [ ] Secrets scanning
- [ ] Logging redaction

## API-specific
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] JWT validation
