# Contributing to SolidAI

Thanks for contributing to the SolidAI platform! 🙌

## Code of Conduct

Everyone participating in this project is expected to follow our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Getting started

1. **Clone** and install:
   ```bash
   git clone https://github.com/YassinAliYassin/solidai-platform.git
   cd solidai-platform
   npm install
   ```
2. **Run the dev server** for the marketing platform:
   ```bash
   npm run dev        # http://localhost:3000
   ```
3. For package work (SRE / LLM / Cloud / Gateway), see each `packages/*/README`.

## How to contribute

1. Open an issue or pick one from the backlog.
2. Create a feature branch: `git checkout -b feat/my-change`.
3. Make focused changes following the guidelines below.
4. Verify with `npm run lint:all` and `npm run build`.
5. Open a Pull Request against `main` using the PR template.

## Guidelines

- **Monorepo discipline:** the root is the marketing platform; product code lives
  in `packages/`. Keep per-package dependencies local to that package.
- **Never commit secrets.** All provider keys (OpenRouter, Gemini, etc.) load from
  the environment; `.env*` is gitignored.
- **No breaking public APIs.** The website's public routes and the chat endpoint
  contract must remain stable. Additive changes are welcome.
- **TypeScript:** run `tsc --noEmit` (root lint) and per-package typechecks.
- **Python (packages/llm):** stdlib-first; run `make test-light` / `make test`.

## Testing

```bash
npm run lint          # root tsc --noEmit
npm run lint:packages # SRE web_ui + Cloud frontend typechecks
npm run lint:all
npm run build         # Vite production build
# Python LLM package
cd packages/llm && make test-light
```

CI (`main.yml`, `llm-tests.yml`) runs these on every push/PR.

## Commit messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`.
