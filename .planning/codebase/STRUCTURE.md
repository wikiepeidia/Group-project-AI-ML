# Codebase Structure

**Analysis Date:** 2026-03-28

## Directory Layout

```
Group-project-AI-ML/
├── .planning/                     # GSD planning documents (auto-generated)
│   └── codebase/                  # Architecture/structure analysis docs
├── .claude/                       # Claude agent definitions and templates
│   ├── agents/                    # Specialist agent role definitions
│   ├── commands/                  # GSD commands (orchestrate, start, sync-template)
│   └── templates/                 # Blank templates for docs (upstream synced)
├── .github/                       # GitHub configuration
│   ├── copilot-instructions.md    # GitHub Copilot directives
│   └── PULL_REQUEST_TEMPLATE.md   # PR template
├── .tasks/                        # GSD task files (one per TODO item)
├── .vscode/                       # VS Code settings (project-specific)
├── .gitignore                     # Git ignore patterns
├── .env (not tracked)             # Environment variables (secrets)
│
├── app.py                         # MAIN ENTRY POINT - Flask monolith
├── CLAUDE.md                      # Claude project instructions
├── PRD.md                         # Product Requirements Document (read-only)
├── START_HERE.md                  # Onboarding template and checklist
├── README.md                      # Project overview and getting started
├── LICENSE                        # Project license
├── TODO.md                        # Task backlog
│
├── core/                          # MAIN SERVICE LAYER
│   ├── __init__.py
│   ├── database.py                # Database abstraction (SQLite/PostgreSQL)
│   ├── auth.py                    # Authentication: user registration, login, password hashing
│   ├── config.py                  # Configuration and environment variables
│   ├── utils.py                   # Shared utilities (datetime parsing, formatting)
│   ├── workflow_engine.py         # Workflow execution: topological sort, node dispatch
│   ├── automation_engine.py       # Business automation logic
│   ├── agent_middleware.py        # AI agent request handling middleware
│   ├── google_integration.py      # Google APIs: Sheets, Drive, Docs, Gmail, Analytics
│   ├── make_integration.py        # Make.com webhook integration
│   └── services/                  # Core microservices
│       ├── __init__.py
│       ├── dl_client.py           # Client for Deep Learning microservice (HTTP or local)
│       └── analytics_service.py   # Event tracking and analytics
│
├── database/                      # DATABASE LAYER
│   ├── __init__.py
│   ├── schema.sql                 # Database schema (if present)
│   └── mock/                      # Mock/test data for development
│
├── ui/                            # USER INTERFACE LAYER
│   └── templates/                 # Jinja2 HTML templates (server-side rendered)
│       ├── base.html              # Base layout template
│       ├── index.html             # Landing/home page
│       ├── dashboard.html         # Main dashboard
│       ├── admin_dashboard.html   # Admin dashboard
│       ├── admin_analytics.html   # Admin analytics view
│       ├── admin_managers.html    # Admin manager management
│       ├── admin_roles.html       # Admin role management
│       ├── admin_subscriptions.html # Subscription management
│       ├── admin_workspace.html   # Admin workspace management
│       ├── customers.html         # Customer list view
│       ├── products.html          # Product list view
│       ├── sale.html              # Sales/transaction view
│       ├── exports.html           # Export data view
│       ├── imports.html           # Import data view
│       ├── create_user_account.html # User account creation
│       ├── manager_permissions.html # Manager permissions view
│       └── components/            # Reusable template components
│           └── sidebar.html       # Navigation sidebar
│
├── dl_service/                    # DEEP LEARNING MICROSERVICE (Port 5001)
│   ├── __init__.py
│   ├── model_app.py               # Flask microservice entry point
│   ├── config.py                  # DL service configuration
│   ├── model_app.py               # Service initialization
│   ├── test_ocr_pipeline.py       # OCR pipeline test
│   ├── train_cnn_models.py        # CNN model training script
│   ├── train_lstm_model.py        # LSTM forecasting model training
│   ├── api/                       # API Blueprint routes for ML models
│   │   ├── __init__.py
│   │   ├── model1_routes.py       # YOLO + OCR document detection routes
│   │   ├── model2_routes.py       # LSTM forecasting routes
│   │   ├── ocr_routes.py          # OCR extraction routes
│   │   └── history_routes.py      # Inference history routes
│   ├── services/                  # Model inference services
│   │   ├── model_loader.py        # Load ML models at startup
│   │   ├── invoice_service.py     # Invoice document processing
│   │   ├── forecast_service.py    # Quantity forecasting with LSTM
│   │   ├── ocr_service.py         # Text extraction service
│   │   └── error_handlers.py      # API error handling
│   ├── models/                    # Pre-trained ML models (heavy - not versioned)
│   │   ├── cpt_vision_extraction/     # Layout detection CNN model
│   │   ├── cpt_vision_localization/   # Field localization model
│   │   ├── cpt_vision_recognition/    # Character recognition model
│   │   ├── vietocr/                    # VietOCR text extraction (Vietnamese)
│   │   │   ├── vietocr/                # Model implementation
│   │   │   │   ├── loader/             # Model file loading
│   │   │   │   ├── model/              # Neural network architecture
│   │   │   │   │   ├── backbone/       # ResNet backbone
│   │   │   │   │   └── seqmodel/       # Sequence modeling layers
│   │   │   │   └── optim/              # Optimization utilities
│   │   │   └── config/                 # VietOCR configuration
│   │   └── project_a_14b_finetuned/    # Fine-tuned model variant
│   ├── database/                  # Local DL service database
│   │   └── inference_history.db   # SQLite for caching results
│   ├── utils/                     # Utility functions for DL service
│   │   └── error_handlers.py      # Error response formatting
│   ├── data/                      # Data for testing/processing
│   │   └── (image samples, test data)
│   ├── uploads/                   # Temporary upload storage
│   └── saved_models/              # Model checkpoint storage
│
├── ai_agent_service/              # AI AGENT MICROSERVICE (autonomous agents)
│   ├── __init__.py
│   ├── main.py                    # Entry point (CLI or server mode)
│   ├── server.py                  # Server implementation
│   ├── requirements.txt           # Python dependencies for agent service
│   ├── training.py                # Agent fine-tuning scripts
│   ├── verify_learning.py         # Learning verification utilities
│   ├── agents/                    # Individual agent implementations
│   │   └── (agent definitions)
│   ├── core/                      # Core agent infrastructure
│   │   └── (agent utilities)
│   ├── tools/                     # Agent tool definitions
│   │   └── ingest_blueprints.py   # Tool for ingesting workflow blueprints
│   ├── models/                    # Fine-tuned LLM models
│   │   ├── project_a_14b_finetuned/    # Fine-tuned base model
│   │   └── adapters_backup/            # LoRA adapter backups
│   ├── data/                      # Agent knowledge and data
│   │   ├── blueprints/                 # Workflow blueprint templates
│   │   ├── docs/                       # Documentation for agents
│   │   ├── schemas/                    # Data schema definitions
│   │   └── my_workflows/               # Example workflows
│   └── api_log.txt                # API call log
│
├── core/                          # (Legacy/duplicate) - May contain legacy code
├── database/                      # (Legacy) - Database utilities
├── evaluate/                      # Model evaluation utilities
│   └── routermatrix.py           # Routing/evaluation logic
├── fixer/                         # Code fixing utilities (if present)
├── jobs/                          # Job storage for async tasks
│   └── (async job data)
├── package/                       # Package management or bundling
├── images/                        # Sample images for testing
├── examples/                      # Example code and demo projects
│   └── demo/                      # Demo application (parallel structure)
│
├── run_dl_service.py              # Script to run DL service standalone (port 5001)
├── package-lock.json              # npm lock file (minimal Node usage)
├── package.json                   # npm config (minimal)
├── DOCUMENTS/                     # Static documentation files
├── MultiAgent.ipynb               # Jupyter notebook for agent experimentation
├── Group-project-AI-ML.rar        # Archived backup of project
├── RETAKENOTES.md                 # Retake/revision notes
├── anser.md                       # Answer/resolution notes
└── .assets/                       # Asset files (images, icons, etc.)
```

## Directory Purposes

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents (auto-generated)
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md
- Generated: Yes (by GSD map-codebase command)
- Committed: Yes (but typically overwritten on re-analysis)

**`core/`:**
- Purpose: Core business logic and service layer
- Contains: Database access, authentication, configuration, workflow orchestration, external integrations
- Key files: `database.py` (SQL wrapper), `auth.py` (user auth), `workflow_engine.py` (automation), `google_integration.py` (external APIs)

**`ui/templates/`:**
- Purpose: Server-rendered HTML templates for web interface
- Contains: Jinja2 templates for all pages (dashboard, admin, user management, analytics)
- Key files: `base.html` (master layout), `dashboard.html` (user dashboard), `admin_*.html` (admin pages)
- Pattern: Inherits from `base.html`, includes components from `components/`

**`dl_service/`:**
- Purpose: Separate microservice for deep learning model inference
- Contains: Flask app, ML model loaders, API routes for YOLO/CNN/LSTM/OCR inference
- Key directories: `models/` (pre-trained ML models), `api/` (HTTP routes), `services/` (inference logic)
- Entry: `run_dl_service.py` (starts on port 5001)
- Design: Can run standalone or be called locally via `DLClient` in main app

**`ai_agent_service/`:**
- Purpose: Autonomous agent capabilities for complex automation
- Contains: Agent definitions, tools, fine-tuned LLM models, workflow blueprints
- Key directories: `agents/` (agent implementations), `models/` (fine-tuned LLMs), `data/blueprints/` (workflow templates)
- Entry: `main.py` or `server.py`

**`database/`:**
- Purpose: Database schema and initialization
- Contains: SQL schema definitions, mock data for development
- Key files: `schema.sql` (if present), initialization scripts

**`.claude/`:**
- Purpose: GSD orchestration configuration and agent definitions
- Contains: Agent role files, command definitions, template library
- Committed: Yes (source of truth for agent behavior)
- Note: Do not edit templates in `.claude/templates/` directly; they are upstream originals

**`.tasks/`:**
- Purpose: Individual task definition files (one per TODO item)
- Contains: Task metadata, acceptance criteria, dependencies, history
- Files: `NNN-short-title.md` format (e.g., `001-user-auth-schema.md`)
- Owned by: @project-manager agent

## Key File Locations

**Entry Points:**
- `app.py`: Main Flask monolith - starts web server on port 5000
- `run_dl_service.py`: Deep Learning service - starts on port 5001
- `ai_agent_service/main.py`: AI Agent service entry point
- `dl_service/model_app.py`: Direct DL service entry (usually run via `run_dl_service.py`)

**Configuration:**
- `CLAUDE.md`: Project instructions and conventions for Claude
- `PRD.md`: Product requirements (READ-ONLY)
- `core/config.py`: Runtime configuration and environment variables
- `dl_service/config.py`: DL service configuration
- `.env`: Environment variables file (secrets, not committed)

**Core Logic:**
- `core/database.py`: SQLite/PostgreSQL abstraction
- `core/workflow_engine.py`: Multi-step workflow execution
- `core/auth.py`: User authentication
- `core/google_integration.py`: Google API calls (Sheets, Drive, Docs, Gmail, Analytics)
- `core/services/dl_client.py`: Interface to DL microservice

**Testing:**
- `dl_service/test_ocr_pipeline.py`: Test OCR extraction pipeline
- `dl_service/test_vietocr.py`: Test Vietnamese OCR
- `ai_agent_service/verify_learning.py`: Test agent learning
- Tests are ad-hoc and not formally organized

**Databases:**
- Default: SQLite at `database/` (development-friendly, no server required)
- Fallback: PostgreSQL support with shim layer in `core/database.py`
- Local DL service: `dl_service/database/inference_history.db`

## Naming Conventions

**Files:**
- `app.py` - Main Flask application
- `*_routes.py` - Blueprint route handlers (e.g., `model1_routes.py`, `ocr_routes.py`)
- `*_service.py` - Service/business logic (e.g., `invoice_service.py`, `analytics_service.py`)
- `*_client.py` - HTTP client for external service (e.g., `dl_client.py`)
- `test_*.py` - Test scripts (not following unittest convention)
- `*_engine.py` - Complex orchestration logic (e.g., `workflow_engine.py`, `automation_engine.py`)
- `*_integration.py` - External API integration (e.g., `google_integration.py`, `make_integration.py`)

**Directories:**
- `core/` - Core business logic
- `ui/` - User interface (templates, static assets)
- `models/` - ML model storage (in both `dl_service/` and `ai_agent_service/`)
- `api/` - HTTP API route definitions (in `dl_service/`)
- `services/` - Service implementations
- `utils/` - Utility functions
- `data/` - Data files (blueprints, schemas, test data)

**Templates:**
- `base.html` - Master layout template
- `admin_*.html` - Administrator pages (admin_dashboard, admin_analytics, etc.)
- `*.html` - User-facing pages (dashboard, customers, products, etc.)
- `components/*.html` - Reusable template fragments

## Where to Add New Code

**New Feature (e.g., "Invoice Analysis"):**
- Primary code: `core/` for business logic, `ui/templates/` for UI
- API routes: Add route handler in `app.py` or create new blueprint file
- Services: `core/services/feature_service.py` for feature-specific logic
- Database: Schema updates in `database/` with migration
- Tests: `dl_service/test_feature.py` (following existing test pattern)

**New Component/Module:**
- Implementation: `core/` for logic, `ui/templates/components/` for UI components
- Integration: Import and register in `app.py`
- Config: Environment variables in `.env` template, handled in `core/config.py`

**New ML Model Integration:**
- Model files: `dl_service/models/model_name/`
- Service: `dl_service/services/model_name_service.py`
- Routes: `dl_service/api/model_name_routes.py`
- Loader: Register in `dl_service/services/model_loader.py`
- Client: Add method to `core/services/dl_client.py` if calling from main app

**Utilities:**
- Shared helpers: `core/utils.py` (for main app), `dl_service/utils/` (for DL service)
- Template helpers: `ui/templates/components/` for reusable fragments
- Error handling: Follow patterns in `dl_service/utils/error_handlers.py`

**New Route/Endpoint:**
- Web page: Create template in `ui/templates/`, add route handler in `app.py`
- API endpoint: Create blueprint in appropriate `*_routes.py` file, register in app
- DL service endpoint: Create route in `dl_service/api/`, register blueprint in `model_app.py`

**External Integration:**
- If third-party API: Create `core/service_name_integration.py` following pattern of `google_integration.py`
- Configure credentials: Environment variables, secrets file, or parameter injection
- Add client: If calling from workflows, extend `DLClient` or create service-specific client

## Special Directories

**`dl_service/models/`:**
- Purpose: Pre-trained ML models (YOLO, LSTM, VietOCR, CNN)
- Generated: Yes (trained offline, committed as binary files)
- Committed: Yes (large files, not ideal but necessary)
- Notes: Do not modify - retrain models separately if needed

**`ai_agent_service/models/`:**
- Purpose: Fine-tuned LLM models and adapters
- Generated: Yes (fine-tuned from base models)
- Committed: Yes
- Notes: Trained via `training.py`, can be backed up to `adapters_backup/`

**`jobs/`:**
- Purpose: Storage for asynchronous job results and status
- Generated: Yes (at runtime)
- Committed: No (created in `.gitignore`)
- Pattern: Job ID → job data/results mapping

**`database/`:**
- Purpose: SQLite database file(s)
- Generated: Yes (auto-created on first run if not exists)
- Committed: Depends on use case (usually no for production, yes for demo fixtures)
- Notes: Schema migrations tracked in code, actual DB file in .gitignore

**`dl_service/uploads/` and `dl_service/saved_models/`:**
- Purpose: Temporary uploads and model checkpoints
- Generated: Yes (at runtime)
- Committed: No (.gitignore)

---

*Structure analysis: 2026-03-28*
