# Security finding: impersonation tokens can write config (read-only not enforced)

**Severity:** Medium–High (authorization gap; advertised read-only contract not enforced)
**Status:** Unconfirmed intent — needs owner decision (real bug vs. intended)
**Found:** during config_service test-suite repair (test_impersonation_token_cannot_write)

## What
`/auth/me` reports impersonation tokens as `can_write: false`, but the config
write endpoint does not enforce it. An impersonation (read-only) token can
successfully `PATCH /api/v1/config/me` and receive `200 OK`.

The test `tests/test_impersonation_tokens.py::test_impersonation_token_cannot_write`
expects `403`, but the code returns `200`.

## Evidence (file:line)
- `src/api/routes/auth_me.py:195` — `can_write = (auth_kind == "oidc") and (...)`,
  so impersonation ⇒ `can_write=False` (exposed at line 206).
- `src/api/routes/config_v2.py:1072` — `@router.patch("/me")` write endpoint.
- `src/api/routes/config_v2.py:1088` — only calls `_check_visitor_write_access(...)`.
- `src/api/routes/config_v2.py:40-48` — `_check_visitor_write_access` is now a
  no-op (`pass`) — "visitors allowed to write for playground demo".
- `src/api/routes/config_v2.py:80-82` — `_resolve_team_identity` resolves
  impersonation tokens the same as any team principal; no write gate.

Net: the read-only intent (`can_write=False`) is computed and advertised but
never checked on the write path.

## Options for the owner
1. If impersonation is meant to be read-only (matches `can_write=False`):
   enforce it — have `PATCH /me` (and other write routes) reject when the
   authenticated principal is impersonation / `can_write` is false → 403.
2. If impersonation writes are intended: update the test to expect 200 and
   reconcile the `can_write=False` advertised by `/auth/me`.

## Related stale tests (same area, need decisions)
- `test_put_me_rejects_team_name` — PATCH /me no longer rejects `team_name` (200 vs 400).
- `test_me_effective_is_cached_and_invalidated_on_put` — caching removed
  ("always recomputes"); test counts cache calls → obsolete.
- `test_me_audit_after_put` — `GET /me/audit` endpoint does not exist (404).
- `test_admin_node_effective_and_raw` — 400 because `root` node not auto-created.
- `test_migration` — FileNotFoundError (missing migration fixture).
