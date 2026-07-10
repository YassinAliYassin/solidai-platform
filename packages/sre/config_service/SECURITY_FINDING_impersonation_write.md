# config_service: remaining test failures + security finding

**Branch:** `fix/config-service-me-verb-tests` (pushed to origin, PR not yet opened)
**Suite status:** 66 passed, 4 failed (was 51 passed / 19 failed at session start)

## SECURITY FINDING (FIXED in this branch)
Impersonation tokens were advertised read-only (`can_write=False` via
`/auth/me`) but `PATCH /api/v1/config/me` did not enforce it (200 instead of
403). Added `_check_write_access()` in `src/api/routes/config_v2.py` rejecting
impersonation principals with 403; visitor writes remain allowed (playground).
`tests/test_impersonation_tokens.py::test_impersonation_token_cannot_write`
now passes.

Root cause file:line: `config_v2.py:40-48` (`_check_visitor_write_access` no-op)
+ `config_v2.py:1088` (write path had no impersonation gate).

## Remaining 4 failures — owner/product decisions (NOT mechanical)
1. `test_admin_node_effective_and_raw` — 400: `root` org node is never created;
   test assumes auto-create. Decide: create root in fixture or assert 404.
2. `test_me_audit_after_put` — 404: `GET /api/v1/config/me/audit` endpoint does
   not exist in current code. Decide: restore endpoint or remove test.
3. `test_put_me_rejects_team_name` — 200 vs 400: `PATCH /me` no longer rejects
   a `team_name` field. Was that validation intentionally removed?
4. `test_me_effective_is_cached_and_invalidated_on_put` — obsolete: caching was
   removed ("always recomputes"); test counts cache recompute calls.

## NOTE: test_migration is environment-driven, NOT a code bug
`test_migration` invokes the `alembic` CLI via subprocess. It only fails when
the venv lacks `alembic` (and full deps). Installing the full
`requirements.txt` (what CI does) makes it pass. If running locally, set up
with `pip install -r requirements.txt`, not a partial dependency subset.
