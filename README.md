# SolidAI

Unified monorepo for the SolidAI platform — AI-powered enterprise solutions for African tech infrastructure, built by [Solid Solutions](https://solidsolutions.africa).

## Repository Structure

| Path | Description | Former repo |
|------|-------------|-------------|
| `/` (root) | SolidAI marketing platform (React + Vite) | `solidai-platform` |
| `packages/sre/` | AI SRE agent for incident investigation | `solidai-sre` |
| `packages/llm/` | Private LLM training & inference | `solid-llm` |
| `packages/cloud/` | Solid Cloud AI backend, frontend & MCP server | `solid-cloud-ai` |
| `packages/gateway/` | Multi-agent gateway (Telegram, WhatsApp, web) | local only |
| `infra/backup/` | Backup scripts and Hermes sync helpers | n/a (added in monorepo) |

## Quick Start

### Platform (website)

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # output: dist/
```

### SRE Agent

```bash
cd packages/sre
cp .env.example .env
make dev       # http://localhost:3000
```

### LLM

```bash
cd packages/llm
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python inference/api_v2.py
```

### Cloud AI

```bash
cd packages/cloud/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Gateway

```bash
cd packages/gateway
npm install
cp .env.example .env   # create from template if needed
npm start              # http://localhost:18789
```

## Links

- Website: [solidai.africa](https://solidai.africa)
- Parent company: [Solid Solutions](https://solidsolutions.africa)
- GitHub: [YassinAliYassin/solidai-platform](https://github.com/YassinAliYassin/solidai-platform)

## Migration Note

All former SolidAI repositories (`solidai-sre`, `solid-llm`, `solid-cloud-backup`) have been consolidated into this monorepo. Clone this repo for the full platform.