# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| main    | ✅ Active support  |

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities. Report them
privately to **info@solidsolutions.africa** with the subject prefix
`[SECURITY] solidai-platform` and include:

- Description of the vulnerability
- Steps to reproduce
- Affected component (root platform or which `packages/`)
- Suggested fix (optional)

You will receive an acknowledgement within 72 hours.

## Secrets Hygiene

- Provider keys (openrouter, gemini, slack) are **always** environment-driven.
  `.env*` is gitignored; only `.env.example` (with placeholders) is committed.
- The chat assistant's key is stored **server-side** only (`api/chat.ts` on
  Vercel or `public/api/chat.php` on cPanel); never ship it to the client.
- CI-driven deploys read keys from GitHub Secrets, never from the repo.
- If you ever commit a real key, rotate it immediately and purge it from history.
