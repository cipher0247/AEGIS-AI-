# Security Policy

## 1. Supported Versions

We provide security updates and patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 2. Reporting a Vulnerability

The maintainers of **AEGIS-AI** take project security very seriously. If you believe you have discovered a security vulnerability, we appreciate your help in disclosing it responsibly.

### How to Report
- **DO NOT** file a public GitHub issue.
- Please email the project maintainer:  
  **ciphergaming472@gmail.com**
- Include the following details in your report:
  - Description of the vulnerability and attack vector.
  - Step-by-step reproduction instructions or Proof of Concept (PoC).
  - Potential impact assessment.
  - Any suggested fixes or mitigations.

### Response Timeline
- **Initial Acknowledgement:** Within 48 hours of receipt.
- **Triage & Status Update:** Within 5 business days.
- **Patch Release:** Target within 14 calendar days depending on severity.

---

## 3. Security Design Principles

- **Zero Client-Side Secrets:** No API keys, credentials, or service account files are stored in client-side bundles. All external AI calls are securely proxied via server endpoints.
- **SSRF Prevention:** The surface probe strictly denies access to `localhost`, loopback addresses, RFC 1918 private subnets, and cloud instance metadata services (`169.254.169.254`).
- **Defensive Target Verification:** Surface probes are restricted strictly to valid HTTP/HTTPS URLs. Administrative ports (e.g., 22, 3306, 6379, 27017) are blocked by default.
- **Sanitized Outputs:** All report exports and rendered intelligence briefs undergo strict HTML escaping to prevent cross-site scripting (XSS).
- **Zero Hallucination Telemetry:** Telemetry analysis directives strictly enforce evidence citing from raw probe outputs.
