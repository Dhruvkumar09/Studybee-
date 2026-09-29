# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Principles

- **No Secrets in Client**: Private API keys (Gemini, Firebase Service Account, FCM Server Key) must never be bundled into the client web app or native Android APK.
- **Server-Authoritative Roles**: Development host code (`13189`) is validated server-side. Production deployments require cryptographically signed custom tokens.
- **Database Rules**: All data access is secured with `database.rules.json` requiring user authentication and room host ownership.

## Reporting a Vulnerability

If you discover a security issue, please contact the maintainers directly via security@studylive.edu or submit an advisory via GitHub Security Advisories.
