# Roadmap: Group Project AI/ML Retake

## Overview

A 3514-line monolithic `app.py` is refactored into a defensible Flask Blueprint + service layer architecture for a university jury retake. The journey moves from protecting the demo branch against corruption, through extracting services and routes, through wiring the factory and proving testability, to finalizing documentation and freezing the demo. Every phase delivers a coherent, verifiable capability. No new features are added — the goal is to convince the jury that the engineering and methodology are sound.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation and Branch Safety** - Establish protected branches, app factory shell, and extensions module to prevent circular imports
- [ ] **Phase 2: Service Layer Extraction** - Extract all business logic into Flask-free service modules (parallelizable across team)
- [ ] **Phase 3: Blueprint Route Extraction** - Extract all route handlers into Flask Blueprints; verify all features still work
- [ ] **Phase 4: App Factory Wiring and Tests** - Slim app.py to under 100 lines; prove service testability with passing pytest suite
- [ ] **Phase 5: Documentation, Report, and Demo Freeze** - Write module docs, fix report, freeze demo branch before presentation

## Phase Details

### Phase 1: Foundation and Branch Safety
**Goal**: The codebase is safe to work on — branches are protected, circular imports cannot happen, and the app still starts
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):
  1. Running `git branch` shows main, dev, and demo branches; demo branch has protection rules preventing direct push
  2. The app starts without ImportError from any file — `core/extensions.py` holds all shared singletons (db_manager, login_manager, csrf, limiter)
  3. `app.py` contains a `create_app()` function; all existing routes still respond (no regression)
  4. A new team member can run the app from the dev branch without setup surprises
**Plans**: TBD

### Phase 2: Service Layer Extraction
**Goal**: All business logic lives in Flask-free service modules that any team member can test in isolation
**Depends on**: Phase 1
**Requirements**: SRVC-01, SRVC-02, SRVC-03, SRVC-04, SRVC-05
**Success Criteria** (what must be TRUE):
  1. `grep -r "from flask import" services/` returns zero results across all service files
  2. Each of the five service files exists: `wallet_service.py`, `subscription_service.py`, `ai_worker_service.py`, `workflow_service.py`, `dl_proxy_service.py`
  3. Each service function has an inline docstring and accepts plain Python types (no Flask request objects)
  4. Running `python -c "from services import wallet_service"` succeeds with no errors
**Plans**: TBD

### Phase 3: Blueprint Route Extraction
**Goal**: All HTTP routing lives in Blueprint files; every existing feature still works end-to-end
**Depends on**: Phase 2
**Requirements**: ROUT-01, ROUT-02, ROUT-03, ROUT-04, ROUT-05, ROUT-06, ROUT-07
**Success Criteria** (what must be TRUE):
  1. Five Blueprint files exist: `routes/auth.py`, `routes/billing.py`, `routes/workflows.py`, `routes/ai.py`, `routes/dl_proxy.py`
  2. Google OAuth login, wallet topup, workflow save, AI chat, and OCR upload all return correct responses (no 404/500 regressions)
  3. All `url_for()` calls use Blueprint-qualified names (e.g., `url_for('auth.signin')`); `grep -r "url_for('" ui/templates/` finds no unqualified endpoint names
  4. `app.py` no longer contains any route handler function definitions
**Plans**: TBD
**UI hint**: yes

### Phase 4: App Factory Wiring and Tests
**Goal**: `app.py` is under 100 lines and a passing pytest suite proves the service layer is independently testable
**Depends on**: Phase 3
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. `wc -l app.py` outputs a number below 100
  2. `pytest tests/` exits 0 with at least 5 passing tests covering wallet and subscription service functions
  3. `pytest --cov=services` produces a coverage report showing service layer functions are exercised
  4. `tests/conftest.py` exists with a working Flask test client fixture; tests run without needing a live database
**Plans**: TBD

### Phase 5: Documentation, Report, and Demo Freeze
**Goal**: The report matches the running code, module docs exist, and the demo branch is frozen and verified before presentation
**Depends on**: Phase 4
**Requirements**: DOCS-01, DOCS-02, DOCS-03, REPT-01, REPT-02, REPT-03
**Success Criteria** (what must be TRUE):
  1. Each of the five service files and five route files has a companion `.md` documentation file describing its purpose, public functions, and usage
  2. `anser.md` documents how `app.py` was split — architecture decisions, before/after structure, and the service boundary rule
  3. The report contains no informal language, all figures have captions, abstract numbering is correct, and section gaps identified by jury are filled
  4. `git log demo` shows the demo branch was last updated from a verified-passing dev state; smoke test results are recorded
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Branch Safety | 0/TBD | Not started | - |
| 2. Service Layer Extraction | 0/TBD | Not started | - |
| 3. Blueprint Route Extraction | 0/TBD | Not started | - |
| 4. App Factory Wiring and Tests | 0/TBD | Not started | - |
| 5. Documentation, Report, and Demo Freeze | 0/TBD | Not started | - |
