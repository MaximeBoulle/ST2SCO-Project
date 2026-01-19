# Security Policy

## Automated Security Scanning

This project uses comprehensive automated security scanning in the CI/CD pipeline:

### Tools in Use

1. **SAST (Semgrep)**: Static code analysis for security vulnerabilities
2. **SCA (Snyk)**: Dependency vulnerability scanning
3. **Secret Scanning (Gitleaks)**: Detection of exposed secrets and credentials
4. **DAST (OWASP ZAP)**: Dynamic application security testing
5. **IaC Scanning (Checkov)**: Infrastructure-as-code security checks

### Viewing Security Findings

Security scan results are available in:
- GitHub Security tab → Code scanning alerts
- Actions tab → Individual workflow runs
- Downloadable artifacts in workflow runs

## Reporting a Vulnerability

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email the security team at: [maxime.boulle@efrei.net](mailto:maxime.boulle@efrei.net)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Best Practices

### For Contributors

- Never commit secrets, API keys, or passwords
- Keep dependencies up to date
- Fix security findings before merging PRs
- Use environment variables for sensitive configuration
- Follow secure coding practices

### For Maintainers

- Review security scan results regularly
- Triage and prioritize security issues
- Update dependencies promptly
- Rotate API tokens and secrets regularly
- Monitor the Security tab for alerts

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Security Updates

Security updates are released as needed. Subscribe to repository notifications to stay informed.
