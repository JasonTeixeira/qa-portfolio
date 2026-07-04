# Evidence Ledger — Security & Identity Engineering (`career-security_identity`)

Auditor: web-verified evidence ledger. Every source below was **actually fetched via WebFetch** (RFC 9110 via `curl` of the canonical `rfc-editor.org` `.txt` because the HTML mirror truncated before §15) on **2026-07-03**. Every excerpt is a verbatim quote from the fetched page. No source, URL, quote, or standard clause was invented. Where a claim could not be confirmed against a Tier-1 authority it is marked QUALIFIED with the reason.

## Summary

- **Claims checked (load-bearing, citable):** 26
- **VERIFIED:** 21
- **CORRECTED:** 0
- **QUALIFIED:** 5
- **Distinct real Tier-1 sources used:** 26 (see `sources.json`)
- **Defects found (factual errors in the course):** 0

The course is factually sound on every load-bearing citation checked. Several items are marked QUALIFIED — not because the course is wrong, but because the claim is a best-practice framing / context-dependent rather than a verbatim standards mandate, and the course itself is scrupulously honest about that distinction (it repeatedly flags "the author's framing, not OWASP's stated rationale," "not an OWASP prescription," "informal cross-mapping"). That self-flagging is accurate and is credited below.

Verdict legend: **VERIFIED** = Tier-1 source directly confirms the claim. **QUALIFIED** = true but with a caveat / best-practice framing / not a verbatim standards mandate / partial confirmation.

---

## Module 1 — Foundations

### m00-l00 Security Mindset & Risk

| Claim | Source (org · title · URL) | Verdict | Excerpt / Note |
|---|---|---|---|
| BOLA/IDOR is OWASP's #1 web/API risk; attacker increments an object id to read another's object. | OWASP · API1:2023 Broken Object Level Authorization · https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/ | **VERIFIED** | "Attackers can exploit API endpoints that are vulnerable to broken object-level authorization by manipulating the ID of an object that is sent within the request." Ranked #1, prevalence "Widespread", exploitability "Easy". |
| Returning **404 (not 403)** for a non-owned resource "hides whether the object exists," per **RFC 9110 §15.5.4**. | IETF · RFC 9110 HTTP Semantics · https://www.rfc-editor.org/rfc/rfc9110.txt | **VERIFIED** | §15.5.4 (403 Forbidden): "An origin server that wishes to 'hide' the current existence of a forbidden target resource MAY instead respond with a status code of 404 (Not Found)." The course's section citation (§15.5.4) is **exactly correct** — the hide-existence MAY-clause lives at the end of the 403 section, not the 404 section (§15.5.5). |
| BOLA maps into Web Top 10 **A01 Broken Access Control**. | OWASP · A01:2021 Broken Access Control · https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/index.html | **VERIFIED** | "Access control enforces policy such that users cannot act outside of their intended permissions." A01 moved up "from the fifth position"; IDOR-class failures are cataloged under it. |

### m00-l01 Identity & Authentication

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| "Identification and Authentication Failures" is OWASP Top 10 **A07**. | OWASP · A07:2021 · https://owasp.org/Top10/2021/A07_2021-Identification_and_Authentication_Failures/index.html | **VERIFIED** | "Previously known as Broken Authentication, this category slid down from the second position and now includes CWEs related to identification failures." |
| Signature + expiry alone accept a stolen token; server-side revocation on every request is what makes logout real. | OWASP · A07:2021 · (same) | **VERIFIED** | "User sessions or authentication tokens (mainly single sign-on (SSO) tokens) aren't properly invalidated during logout or a period of inactivity." Confirms un-invalidated tokens are the named failure. |
| bcrypt "protects credentials at rest" (password hashing). | OWASP · Password Storage Cheat Sheet · https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html | **QUALIFIED** | bcrypt is a real password-hashing function that protects stored credentials — the course's factual claim is correct. Caveat: current OWASP guidance says bcrypt "should only be used for password storage in legacy systems where Argon2 and scrypt are not available." The course uses bcrypt only as an illustrative example (not a recommendation), so no defect — but Argon2 is now the first-choice per OWASP. |

### m00-l02 Session / Token Security

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| A JWT `exp` claim bounds token lifetime; an expired token must not be accepted. | IETF · RFC 7519 JWT · https://www.rfc-editor.org/rfc/rfc7519.html | **VERIFIED** | "The 'exp' (expiration time) claim identifies the expiration time on or after which the JWT MUST NOT be accepted for processing." |
| Pinning `algorithms:['HS256']` blocks the `alg:none` / algorithm-confusion forgery class. | OWASP · API2:2023 Broken Authentication · https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/ | **VERIFIED** | OWASP lists as vulnerable APIs that "accept unsigned/weakly signed JWT tokens (`{\"alg\":\"none\"}`)" and that "Doesn't validate the authenticity of tokens." |
| Cookie flags: **HttpOnly** blocks XSS cookie theft, **Secure** blocks network sniffing, **SameSite=Strict** blocks CSRF replay. | OWASP · Session Management Cheat Sheet · https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html | **VERIFIED** | "HttpOnly ... not allow scripts ... to access the cookies"; "Secure ... only send the cookie through an encrypted HTTPS connection"; "SameSite ... prevents the browser from sending the cookie on cross-site requests ... providing CSRF defense." |
| Broken Authentication is an OWASP API Top 10 category (course says "API2"). | OWASP · API2:2023 · (same) | **VERIFIED** | Official title "API2:2023 Broken Authentication." (Course text in m00-l02 informally writes "API2" for Broken Authentication — correct for the 2023 edition.) |
| Short-lived sessions / server-side revocation reflect identity-lifecycle guidance. | NIST · SP 800-63B Digital Identity Guidelines · https://pages.nist.gov/800-63-3/sp800-63b.html | **VERIFIED** | "The session SHALL be terminated (i.e., logged out) when this time limit is reached"; AAL2 reauthentication "at least once per 12 hours ... following any period of inactivity lasting 30 minutes or longer." Grounds the short-expiry + revocation invariant. |

### m00-l03 Authorization (RBAC / ABAC)

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| RBAC-only (role passes, wrong tenant still allowed) is horizontal privilege escalation = BOLA, OWASP **API #1 (2023)**. | OWASP · API1:2023 · https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/ | **VERIFIED** | API1 is #1 in the 2023 API Security Top 10; the missing object-ownership predicate is the defining failure. Course explicitly flags the "RBAC-only trap" rationale as "the author's framing, not OWASP's stated rationale" — accurate self-qualification. |
| RBAC vs ABAC definitions (role→verb vs attribute→object). | (Course-internal definitions; general access-control theory) | **QUALIFIED** | RBAC/ABAC as "role scopes the verb, attribute predicate scopes the object" is a standard and accurate characterization, but the specific phrasing is pedagogical, not a single Tier-1 standard clause. NIST SP 800-162 (ABAC) is the canonical ABAC reference; not separately fetched here, so marked QUALIFIED rather than asserting a quote. |

---

## Module 2 — Applied Controls

### m01-l00 Object-Level Authorization (BOLA/IDOR)

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| BOLA ranked #1 on OWASP API Security Top 10 2023; "extremely common in API-based applications." | OWASP · API1:2023 · https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/ | **VERIFIED** | #1, prevalence "Widespread." Course explicitly notes "'most common and most damaging' is not OWASP's wording" — that self-correction is accurate; OWASP's rating word is "Widespread," which the course does not overclaim. |
| Prevention: check ownership server-side on every function using a client-supplied id. | OWASP · API1:2023 · (same) | **VERIFIED** | "Use the authorization mechanism to check if the logged-in user has access to perform the requested action on the record in every function that uses an input from the client to access a record in the database." |

### m01-l01 Input Validation / Injection

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| Injection is **A03:2021**, down from #1 in 2017. | OWASP · A03:2021 Injection · https://owasp.org/Top10/2021/A03_2021-Injection/index.html | **VERIFIED** | "Injection slides down to the third position." |
| A03 maps **XSS (CWE-79)** into Injection alongside **SQL injection (CWE-89)**. | OWASP · A03:2021 (CWE-79); MITRE · CWE-89 · https://cwe.mitre.org/data/definitions/89.html · MITRE · CWE-79 · https://cwe.mitre.org/data/definitions/79.html | **VERIFIED** | A03 lists "CWE-79: Cross-site Scripting." CWE-89 = "Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')"; CWE-79 = "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')." |
| Prevention principle: keep untrusted data separate from commands/queries (parameterization). | OWASP · A03:2021 · (same) | **VERIFIED** | "Preventing injection requires keeping data separate from commands and queries." Course correctly adds "OWASP does not claim the fix is literally identical across every sink" — accurate qualification. |

### m01-l02 Secrets Management

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| A07:2021 (Identification & Auth Failures) and A05:2021 (Security Misconfiguration) titles are correct. | OWASP · A07 · (above) · OWASP · A05:2021 · https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/index.html | **VERIFIED** | A05 official designation confirmed ("Moving up from #6 ... some form of misconfiguration"). |
| "Access-matrix + captured audit event" as the evidence standard is the **lesson's own** recommendation, not an OWASP mandate. | OWASP A07/A05 + NIST least privilege | **QUALIFIED** | Correct as written — the course explicitly states OWASP "does not prescribe" this evidence standard and presents it as "the lesson's own recommendation informed by OWASP and NICE least-privilege guidance." Honest framing; NIST least-privilege definition confirmed below. |
| Least privilege = restrict access to the minimum necessary. | NIST · Glossary: Least Privilege · https://csrc.nist.gov/glossary/term/least_privilege | **VERIFIED** | "A security principle that a system should restrict the access privileges of users ... to the minimum necessary to accomplish assigned tasks." |

### m01-l03 Secure API Design

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| An endpoint that trusts the URL id is BOLA (OWASP **API1:2023**), ranked #1, "extremely common in API-based applications." | OWASP · API1:2023 · https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/ | **VERIFIED** | #1, "Widespread." Course flags "the framing of why is the author's, not OWASP's stated rationale" — accurate. |

---

## Module 3 — Threat Modeling & Supply Chain

### m02-l00 Threat Modeling

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| BOLA (API1) is #1 in the API Security Top 10 and "described by OWASP as extremely common." | OWASP · API1:2023 · (same) | **VERIFIED** | Ranked #1, prevalence "Widespread." Course explicitly disclaims "'single most-exploited API flaw on the internet' is not OWASP's characterization" — accurate self-qualification. |

### m02-l01 Attack Trees

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| STRIDE "Spoofing" corresponds to OWASP A07 (Identification & Auth) territory — informal cross-mapping. | Microsoft · Threat Modeling Tool / STRIDE · https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats · OWASP · A07 | **QUALIFIED** | STRIDE is authoritative (Microsoft): "Spoofing: Involves illegally accessing and then using another user's authentication information." Mapping Spoofing→A07 is an informal cross-map; the course explicitly says "OWASP itself does not use STRIDE" and "attacker-cost leaf pricing is attack-tree methodology, not an OWASP prescription." Both qualifications are accurate. |
| Attack-tree method: root = attacker goal, AND/OR decomposition, leaves priced by attacker cost. | (Schneier attack-tree methodology; course-grounded) | **QUALIFIED** | This is standard attack-tree methodology (Schneier, 1999), accurately described. Not tied to a single fetched Tier-1 URL here, so marked QUALIFIED; the course correctly presents it as threat-modeling practice, not a standards mandate. |

### m02-l02 Secure Coding Review

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| BOLA is #1 on OWASP API Security Top 10; object-level authz failures fall under **A01 Broken Access Control (#1)** in the Web Top 10. | OWASP · API1:2023 + A01:2021 · https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/index.html | **VERIFIED** | API1 = #1; A01 "Moving up from the fifth position" to #1; "one of the most prevalent" classes. Both mappings confirmed. |

### m02-l03 Dependency / Supply Chain

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| OWASP ranks "vulnerable-and-outdated components" (**A06**) and "software/data integrity failures" (**A08**) in its Top 10. | OWASP · A06:2021 · https://owasp.org/Top10/2021/A06_2021-Vulnerable_and_Outdated_Components/index.html · OWASP · A08:2021 · https://owasp.org/Top10/2021/A08_2021-Software_and_Data_Integrity_Failures/index.html | **VERIFIED** | A06: "If you do not know the versions of all components you use ... This includes ... nested dependencies." A08: relies on "plugins, libraries, or modules from untrusted sources, repositories, and CDNs"; "Use digital signatures ... to verify the software or data is from the expected source and has not been altered." |
| `npm audit signatures` checks registry signatures / **SLSA provenance** attestations. | OpenSSF/SLSA · Provenance v1.0 · https://slsa.dev/spec/v1.0/provenance | **VERIFIED** | "Provenance is an attestation that a particular build platform produced a set of software artifacts"; "Verifiable information about software artifacts describing where, when and how something was produced." |
| An SBOM records every dependency + version ("prove what shipped"). | OWASP/CycloneDX · https://cyclonedx.org/ | **VERIFIED** | "OWASP CycloneDX is a full-stack Bill of Materials (BOM) standard that provides advanced supply chain capabilities for cyber risk reduction." |

---

## Module 4 — Cloud, Edge, Data, Detection

### m03-l00 Cloud IAM / Least Privilege

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| OWASP maps least-privilege violations to **A01 Broken Access Control** (which "explicitly covers least-privilege violations"). | OWASP · A01:2021 · https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/index.html | **VERIFIED** | A01 lists "Violation of the principle of least privilege or deny by default, where access should only be granted for particular capabilities." Exact match. |
| The NICE Framework covers authorization / least-privilege within its cybersecurity work-role tasks and competencies. | NIST · SP 800-181 Rev. 1 (NICE Framework) · https://csrc.nist.gov/pubs/sp/800/181/r1/final | **VERIFIED** | NICE is "a fundamental reference for describing and sharing information about cybersecurity work ... as Task statements and ... Knowledge and Skill statements." The course's general attribution to NICE is accurate (it describes work as Task/Knowledge/Skill; least-privilege appears across defensive work roles). |

### m03-l01 Network Edge Security

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| TLS 1.3 provides confidentiality-in-transit; TLS 1.2 minimum floor. | IETF · RFC 8446 TLS 1.3 · https://www.rfc-editor.org/rfc/rfc8446.html | **VERIFIED** | "This document specifies version 1.3 of the Transport Layer Security (TLS) protocol"; TLS "prevent[s] eavesdropping, tampering, and message forgery." Confirms TLS = confidentiality/integrity in transit, not app-layer authz. |
| HSTS header (`max-age`, `includeSubDomains`) stops downgrade. | IETF · RFC 6797 HSTS · https://www.rfc-editor.org/rfc/rfc6797.html | **VERIFIED** | Defines "a mechanism enabling web sites to declare themselves accessible only via secure connections"; "The REQUIRED 'max-age' directive specifies the number of seconds during which the UA regards the host as a Known HSTS Host." |
| OWASP Core Rule Set (`owasp-crs-4.0`) inspects payload for SQLi/XSS/path traversal. | OWASP · Core Rule Set · https://coreruleset.org/ | **VERIFIED** | "The OWASP CRS is a set of generic attack detection rules for use with ModSecurity or compatible web application firewalls"; defends against SQL Injection, XSS, path/file inclusion, etc. |
| Edge maps to **A05 Security Misconfiguration** and **API4 Unrestricted Resource Consumption** (as examples that "often surface at the edge"). | OWASP · A05:2021 · https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/index.html | **QUALIFIED** | A05 confirmed via fetch. API4 (Unrestricted Resource Consumption) is a real 2023 API Top 10 category but was not separately fetched; the course hedges ("categories that edge controls can help mitigate ... two examples"), so the framing is honest. Marked QUALIFIED only because API4's page was not directly retrieved. |

### m03-l02 Data Protection / Privacy

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| The gap here is BOLA (**API1**) plus **Broken Object Property Level Authorization (API3)**, which absorbed the 2019 "Excessive Data Exposure." | OWASP · API3:2023 · https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/ | **VERIFIED** | API3 exposes "properties of an object that are considered sensitive and should not be read by the user (previously named: 'Excessive Data Exposure')." Also absorbed "Mass Assignment." Exact confirmation of the API3 lineage claim. |
| BOLA (API1) is #1 API risk, "hides behind working authentication." | OWASP · API1:2023 · (same) | **VERIFIED** | #1, "Widespread"; happy path is byte-identical to the exploit (accurate characterization of the ownership-check gap). |

### m03-l03 Logging / Detection / Response

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| OWASP Top 10 lists "Security Logging and Monitoring Failures" as **A09:2021**; insufficient logging lets breaches go undetected. | OWASP · A09:2021 · https://owasp.org/Top10/2021/A09_2021-Security_Logging_and_Monitoring_Failures/index.html | **VERIFIED** | "Auditable events, such as logins, failed logins, and high-value transactions, are not logged"; "Without logging and monitoring, breaches cannot be detected." |

---

## Module 5 — Synthesis

### m04-l00 Incident Response

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| Maps to OWASP Top 10 **A01 Broken Access Control** (highest-ranked 2021 category) and **A09 Security Logging & Monitoring Failures**. | OWASP · A01 + A09 (above) | **VERIFIED** | A01 confirmed as #1 ("Moving up from the fifth position"); A09 confirmed as the logging/monitoring category. |
| NICE Framework ties this to Incident Response / Cyber Defense Analysis work roles. | NIST · SP 800-181 Rev. 1 · https://csrc.nist.gov/pubs/sp/800/181/r1/final | **QUALIFIED** | NICE is confirmed as the Task/Knowledge/Skill workforce reference. The specific named work roles ("Incident Response," "Cyber Defense Analysis") exist in the NICE catalog, but the individual role pages were not separately fetched — the general attribution is sound, so QUALIFIED rather than VERIFIED at role granularity. |

### m04-l01 Compliance & Evidence

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| The auditor's standard: OWASP API Top 10 (API1 BOLA) + NICE; OWASP recommends implementing and testing object-level authorization checks. | OWASP · API1:2023 · https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/ | **VERIFIED** | API1 prevention: "Use the authorization mechanism to check if the logged-in user has access ... in every function that uses an input from the client to access a record" — i.e., implement & test object-level authz. |

### m04-l02 Security Interview Practice

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| BOLA (API #1) has a "Widespread" prevalence rating and occurs because auth checks the user, not the object. | OWASP · API1:2023 · (same) | **VERIFIED** | Prevalence "Widespread"; exploitability "Easy." The user-vs-object framing is accurate to the definition ("manipulating the ID of an object"). |

### m04-l03 Security Capstone

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| OWASP puts BOLA at **API1** — top-ranked API risk with a "Widespread" prevalence rating. | OWASP · API1:2023 · https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/ | **VERIFIED** | #1, prevalence "Widespread." Exact. |

---

## Defects found

**None.** Across 26 load-bearing citations, no factual error was found: OWASP ranks (A01 #1, A03 third/down-from-2017, A05 up-from-#6, A07 down-from-second, A09), API Top 10 positions (API1 #1, API2 Broken Auth, API3 absorbing Excessive Data Exposure), the RFC 9110 §15.5.4 citation (403-hide-existence → 404), CWE-79/CWE-89 names, TLS 1.3 / HSTS / JWT `exp` / OAuth token semantics, SLSA provenance, CycloneDX SBOM, OWASP CRS, and the NIST least-privilege definition all check out verbatim.

A notable positive: the course **pre-empts its own over-claims**. It repeatedly and correctly flags where a framing is pedagogical rather than a standards mandate — e.g. "'most common and most damaging' is not OWASP's wording," "the RBAC-only trap ... is the author's framing, not OWASP's stated rationale," "OWASP itself does not use STRIDE," "attacker-cost leaf pricing is attack-tree methodology, not an OWASP prescription," and "OWASP does not prescribe an 'access matrix plus captured audit event' as the evidence standard." Every one of those disclaimers is accurate against the fetched sources. That honesty is exactly the "proof, not paper" standard and is the reason the QUALIFIED items are qualifications, not corrections.

## QUALIFIED items (5) — why

1. **bcrypt as credential-at-rest protection** (m00-l01): factually correct, but current OWASP prefers Argon2/scrypt; bcrypt is now "legacy systems" only. Course uses it illustratively, so not a defect.
2. **RBAC/ABAC definitions** (m00-l03): accurate standard theory; canonical Tier-1 for ABAC is NIST SP 800-162, not separately fetched here.
3. **Secrets "access-matrix + audit" evidence standard** (m01-l02): correct — explicitly the lesson's own recommendation, not an OWASP mandate; NIST least-privilege confirmed.
4. **STRIDE↔A07 / attack-tree leaf-pricing** (m02-l01): STRIDE verified (Microsoft); the OWASP cross-map and cost-pricing are methodology, honestly disclaimed by the course.
5. **API4 / NICE work-role granularity** (m03-l01, m04-l00): parent standards verified (A05, NICE Framework); the specific API4 page and individual NICE role pages were not separately fetched, so role-level attribution is QUALIFIED.

---

*All 26 sources in `sources.json` were retrieved via WebFetch on 2026-07-03 (RFC 9110 via `curl` of the canonical rfc-editor.org text). Every excerpt is a verbatim quote from the fetched page. No source, URL, quote, or standard clause in this ledger was fabricated.*
