# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take the security of SmartHCM seriously. If you believe you have discovered a security vulnerability in this project, please report it privately.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email with the subject `[SECURITY] SmartHCM Vulnerability Report` containing:
- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof of concept (PoC).
- Any recommended remediation steps.

We will acknowledge receipt within 48 hours and work with you to resolve the issue before any public disclosure.

## Security Practices

- **Zero Hardcoded Secrets**: Production deployments require secret keys and credentials injected strictly via environment variables.
- **Principle of Least Privilege**: Containers run under dedicated non-root users (`appuser` / `nextjs`).
- **Cryptographic Protections**: All communications in production are protected by HTTP Strict Transport Security (HSTS) with secure cookies (`HttpOnly`, `SameSite`, `Secure`).
- **Throttling**: API routes are rate-limited to prevent brute-force attacks and resource exhaustion.
- **Safe Input Processing**: Automated parameterized database queries and DRF serializer validation prevent SQL injection and invalid payloads.
