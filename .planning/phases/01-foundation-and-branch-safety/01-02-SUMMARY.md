---
phase: 01-foundation-and-branch-safety
plan: "02"
subsystem: core
tags: [extensions, models, circular-imports, flask-login, flask-limiter, csrf]
dependency_graph:
  requires: []
  provides: [core/extensions.py, core/models.py]
  affects: [app.py, all future blueprints]
tech_stack:
  added: []
  patterns: [factory-only-init, module-level-singletons, dedicated-models-file]
key_files:
  created:
    - core/extensions.py
    - core/models.py
  modified: []
decisions:
  - "D-01 honored: Limiter, CSRFProtect, LoginManager, Database all created without app argument — bound via init_app() in create_app()"
  - "D-02 honored: db_manager importable from core.extensions at module level"
  - "D-03 honored: User class relocated to core/models.py as its own dedicated module"
  - "Backward compatibility: app.py User class left in place until Plan 03 wraps it in create_app()"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-28"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 01 Plan 02: Foundation Files (extensions.py + models.py) Summary

**One-liner:** Created `core/extensions.py` with four app-free Flask singletons (db_manager, login_manager, csrf, limiter) and `core/models.py` with User(UserMixin) class — structurally resolving the circular import problem before Blueprint extraction begins.

## What Was Built

### core/extensions.py

Holds all shared Flask extension singletons created without a Flask `app` argument. This is the factory-only init pattern (D-01): objects exist at import time, bound to a specific app via `init_app()` inside `create_app()`.

Exports: `login_manager`, `csrf`, `limiter`, `db_manager`

Key enforcement decisions:
- `Limiter(get_remote_address)` — no `app=` arg, no `default_limits` (would crash on import)
- `CSRFProtect()` — no arguments (bound later via `csrf.init_app(app)`)
- `LoginManager()` — no arguments (`login_view` set after `init_app()`)
- `Database()` — no arguments (connects to SQLite directly, no Flask dependency)

### core/models.py

Pure relocation of `User(UserMixin)` from `app.py` line 230. Zero behavior change — identical constructor signature (7 fields), identical `name` property. app.py retains its copy until Plan 03 introduces the factory.

Exports: `User`

## Verification Results

| Check | Result |
|-------|--------|
| `from core.extensions import login_manager, csrf, limiter, db_manager` | PASS — prints `extensions OK` |
| `from core.models import User; User(1,'a@b.com','A','B').name` | PASS — prints `A B` |
| `grep "app=" core/extensions.py` | PASS — no executable `app=` found (comment only) |
| `class User(UserMixin)` still in app.py | PASS — line 230 unchanged |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Both files are fully wired with no placeholder data. `db_manager` connects to the real SQLite database on instantiation; `User` class has real field assignments.

## Self-Check: PASSED

- `core/extensions.py` exists: FOUND
- `core/models.py` exists: FOUND
- Commit `b95d3d3` (Task 1): FOUND
- Commit `8684bc4` (Task 2): FOUND
