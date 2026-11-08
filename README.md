# AEGIS-AI: Neural Strategic Reconnaissance & Offensive Intelligence Platform

[![CI/CD Pipeline](https://github.com/cipher0247/AEGIS-AI-/actions/workflows/ci.yml/badge.svg)](https://github.com/cipher0247/AEGIS-AI-/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened-red.svg)](SECURITY.md)

AEGIS-AI is an open-source, full-stack cybersecurity intelligence and automated vulnerability analysis platform. Built for security engineers, red teams, and incident response personnel, AEGIS-AI integrates safe target reconnaissance, OSINT correlation, and multi-model AI synthesis (via Google Gemini) into a cyber-noir tactical command interface.

Repository: **https://github.com/cipher0247/AEGIS-AI-**

---

## 1. Problem Statement

Modern cybersecurity operations require synthesizing vast quantities of raw telemetry—HTTP headers, robots disclosures, sensitive path probes, and OSINT asset records. Traditional scanners produce static lists flooded with generic boilerplate alerts and false positives.

**AEGIS-AI solves this through:**
- **Skeptical Neural Reasoning:** Strict evidence-anchor directives require concrete telemetry strings before any vulnerability is confirmed.
- **Automated Attack Simulation:** Synthesizes realistic, evidence-backed multi-phase attack routes (MITRE ATT&CK aligned).
- **Interactive Topology Visualization:** Renders interactive asset-to-vulnerability exploit graphs powered by D3.js and WebAssembly Graphviz.
- **Enterprise Defenses:** Full-stack architecture protecting API keys on the server, enforcing SSRF boundary validation, and securing session profiles with Firebase RBAC.

---

## 2. Key Features

- **Safe Deep Surface Reconnaissance:** Automated non-destructive probe of HTTP response headers, robots disclosures, technology fingerprints, and sensitive path exposures.
- **SSRF Target Protection:** Strict enforcement forbidding scans against localhost, RFC 1918 private subnets, link-local addresses, and cloud metadata services (`169.254.169.254`).
- **AI Vulnerability Synthesis:** Neural engine powered by `@google/genai` on Node.js/Express, featuring exponential backoff retries and dynamic model fallbacks (`gemini-3.8-flash`, `gemini-flash-latest`, `gemini-3.1-flash-lite`).
- **OSINT Asset Correlation:** Maps discovered subdomains, public API endpoints, cloud configurations, and credentials into an intelligence briefing.
- **Interactive Exploit Topology:** Dynamic graph visualization depicting attack paths, assets, and verified exploit vectors.
- **Real-Time Tactical Assistant:** Live streaming terminal chat grounded on active target telemetry and selected findings.
- **Multi-Format Export Engine:** Download intelligence briefs in raw JSON or publication-ready, XSS-sanitized HTML/PDF formats.
- **Firebase Authentication & RBAC:** Multi-tier role permissions (`OPERATOR`, `COMMANDER`) with zero-trust Firestore rules and security audit logging.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons |
| **Data Viz** | D3.js, @hpcc-js/wasm-graphviz |
| **Backend** | Node.js, Express, tsx |
| **AI Engine** | Google Gen AI SDK (`@google/genai`), server-side execution |
| **Database & Auth** | Firebase Authentication, Cloud Firestore with Attribute-Based Access Control |
| **Testing & CI** | Vitest, Testing Library, GitHub Actions, ESLint, TypeScript Compiler |

---

## 4. Architecture Overview

```
[ Operator Browser Client ]
         |
         | HTTPS / REST & Server-Sent Streams
         v
[ Express Application Server ] (server.ts)
   ├── SSRF & Target Validator (RFC 1918 & Cloud Metadata Filter)
   ├── Non-Destructive Active Surface Recon Engine
   └── Resilient Gemini AI Synthesis Proxy
         ├── Primary: gemini-3.8-flash
         └── Fallbacks: gemini-flash-latest / gemini-3.1-flash-lite
         |
         +----> [ Google Gemini API ] (Server-Side Only)
         |
[ Cloud Firestore & Firebase Auth ]
   ├── /reports/{reportId} (Immutable archived intelligence briefs)
   ├── /audit_logs/{logId} (Write-only telemetry trail)
   └── /users/{userId}     (RBAC & session token rotation)
```

For complete architecture diagrams and sequence flows, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 5. Prerequisites

- **Node.js:** `v20.x` or `v22.x` LTS recommended
- **npm:** `v10.x` or higher
- **Gemini API Key:** Obtainable from [Google AI Studio](https://aistudio.google.com/)
- **Firebase Project:** Configured with Google Authentication and Cloud Firestore

---

## 6. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cipher0247/AEGIS-AI-.git
   cd AEGIS-AI-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your configuration:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   APP_URL="http://localhost:3000"
   ```

4. **Verify Firebase Configuration:**
   Ensure `firebase-applet-config.json` contains your Firebase project credentials.

---

## 7. Development & Production Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite in development mode on `http://localhost:3000` |
| `npm run build` | Compiles production assets with TypeScript and Vite into `dist/` |
| `npm test` | Runs the automated Vitest test suite |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm start` | Launches the production Express server |

---

## 8. Usage Instructions

1. Start the application:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000` and click **Initialize Operator** to authenticate with your Google account.
3. In the **Scope Target** input, provide an authorized target domain (e.g. `api.your-company.com`).
4. Click **Engage Analysis** to execute automated reconnaissance and trigger AI-assisted vulnerability analysis.
5. Review the **Vulnerability Matrix**, **Attack Simulation**, and **Network Topology**.
6. Export the findings via **JSON** or the printable **HTML Brief**.

---

## 9. Security Policy & Disclaimers

> [!CAUTION]
> **Authorized Use Only:** AEGIS-AI is designed strictly for authorized cybersecurity assessments, defensive threat analysis, and educational research. Scanning targets without prior explicit written permission is strictly prohibited.

- **SSRF Protections:** The surface reconnaissance module is hard-coded to reject internal subnets, localhost, and cloud metadata IPs (`169.254.169.254`).
- **Zero Client-Side Secrets:** Gemini API keys are never bundled into frontend assets. All AI communications are brokered through authenticated server proxies.
- For vulnerability disclosures, please review our [SECURITY.md](SECURITY.md).

---

## 10. Roadmap

- [x] Server-side Gemini AI integration with model fallbacks (`gemini-3.8-flash`)
- [x] SSRF target sanitization and RFC 1918 guard
- [x] Automated Vitest testing suite and GitHub Actions CI/CD
- [x] Sanitized HTML/PDF and JSON report export engine
- [ ] CVSS v4.0 scoring calculation engine
- [ ] Export directly to DefectDojo and Jira Security
- [ ] Multi-tenant workspace teams with role delegation

---

## 11. Contributing & Code of Conduct

We welcome community contributions! Please review [CONTRIBUTING.md](CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## 12. License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.  
Copyright (c) 2026 **Addepalle Siva Sankar Raju**.
