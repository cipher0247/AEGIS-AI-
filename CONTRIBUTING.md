# Contributing to AEGIS-AI

Thank you for your interest in contributing to **AEGIS-AI**! We welcome bug fixes, documentation updates, security hardenings, and feature enhancements from the open-source community.

---

## 1. Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please maintain a respectful, constructive, and inclusive environment.

---

## 2. Responsible Security Disclosure

If you discover a security vulnerability, **DO NOT** create a public GitHub issue. Please consult [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

---

## 3. Getting Started

1. **Fork the repository** on GitHub:  
   `https://github.com/cipher0247/AEGIS-AI-`
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/<your-username>/AEGIS-AI-.git
   cd AEGIS-AI-
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up local environment**:
   ```bash
   cp .env.example .env
   ```
   Populate your `GEMINI_API_KEY` for local testing.

---

## 4. Branch Naming Conventions

Prefix your branch name with the purpose of your contribution:
- `feature/` - New feature implementation (e.g., `feature/cvss-v4-calculator`)
- `fix/` - Bug fix (e.g., `fix/ssrf-ipv6-validation`)
- `security/` - Security patch (e.g., `security/sanitize-poc-output`)
- `docs/` - Documentation updates (e.g., `docs/update-architecture-diagram`)
- `refactor/` - Code refactoring without behavior change

---

## 5. Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Allowed types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `chore`: Build or tooling updates

*Example:* `feat(exporter): add printable HTML report generation with XSS escaping`

---

## 6. Development Workflow & Quality Standards

Before submitting a Pull Request, verify that all quality gates pass locally:

1. **TypeScript Verification**:
   ```bash
   npm run lint
   ```
2. **Unit & Integration Tests**:
   ```bash
   npm test
   ```
3. **Production Build**:
   ```bash
   npm run build
   ```

---

## 7. Submitting a Pull Request

1. Push your branch to your forked repository.
2. Open a Pull Request against the `main` branch of `https://github.com/cipher0247/AEGIS-AI-`.
3. Complete the pull request template with a clear explanation of changes, motivations, and testing evidence.
4. Ensure all GitHub Actions CI checks pass. Maintainers will review your contribution promptly.
