# Changelog

All notable changes to the **AEGIS-AI** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-08

### Added
- **Full-Stack Gemini Architecture**: Migrated all AI interactions to secure server-side endpoints (`/api/analyze-scan`, `/api/analyze-osint`, `/api/chat`).
- **Resilience & Model Fallback**: Implemented exponential retry backoff and dynamic model failover across `gemini-3.8-flash`, `gemini-flash-latest`, and `gemini-3.1-flash-lite`.
- **Target Validation & SSRF Guard**: Enforced strict input sanitization blocking `localhost`, RFC 1918 private subnets, link-local addresses, and cloud instance metadata (`169.254.169.254`).
- **Multi-Format Export**: Added publication-grade HTML report generator with XSS escaping alongside raw JSON exports.
- **Automated Testing Suite**: Integrated Vitest test runner with unit tests for target validation, XSS prevention, report generation, and security error masking.
- **GitHub Actions CI/CD**: Added multi-step automated workflow covering dependency installs, type checks, linting, tests, production builds, and security audits.
- **Open-Source Repository Infrastructure**: Added MIT License, Contributing Guide, Security Policy, Code of Conduct, Architecture Documentation, and GitHub issue/PR templates.

### Security
- Eliminated all client-side Gemini API key exposure.
- Standardized Firebase error masking to prevent user enumeration and database schema leakage.
- Blocked administrative service ports (e.g. 22, 3306, 6379, 27017) in surface reconnaissance probes.
