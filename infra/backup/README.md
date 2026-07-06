# SolidAI Backup Infrastructure

Scripts and configuration templates for SolidAI / Solid Solutions backup operations.

Copied from the former `solid-cloud-backup` repository. Sensitive runtime data (`.env`, backup archives, agent memories) is **not** included in this repo.

## Files

- `config.yaml.example` — backup configuration template (copy to `config.yaml` and fill in locally)
- `hermes-dashboard.sh` — Hermes agent dashboard launcher
- `hermes-tablet-sync.sh` — tablet sync helper
- `bashrc-backup` — shell environment backup reference