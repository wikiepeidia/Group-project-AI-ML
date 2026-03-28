# External Integrations

**Analysis Date:** 2026-03-28

## APIs & External Services

**Google Services:**
- Google OAuth2 / OpenID Connect - User authentication
  - SDK/Client: `authlib` + `google-auth-oauthlib`
  - Configuration: `app.py` lines 78-87 (OAuth registration)
  - Auth: Environment variables `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` or `secrets/google_oauth.json`
  - Scopes: drive.readonly, drive.file, spreadsheets, documents, gmail.send, analytics.readonly
  - Implementation: `core/google_integration.py` with InstalledAppFlow for token negotiation

- Google Drive API - File access and document management
  - SDK: `google-api-python-client`
  - Auth: OAuth2 tokens stored and refreshed via `core/google_integration.py`
  - Use case: Read-only access to user's Drive files

- Google Sheets API - Spreadsheet automation
  - SDK: `google-api-python-client`
  - Auth: OAuth2 token scoped to spreadsheets
  - Use case: Workflow automation for retail scenarios

- Google Documents API - Document automation
  - SDK: `google-api-python-client`
  - Auth: OAuth2 token
  - Use case: Generate and modify Google Docs

- Gmail API - Email sending
  - SDK: `google-api-python-client`
  - Auth: OAuth2 token with `gmail.send` scope
  - Use case: Automated email notifications

- Google Analytics Data API - Analytics reporting
  - SDK: `google-analytics-data` (BetaAnalyticsDataClient)
  - Auth: Service account credentials from `secrets/analytics_service_account.json`
  - Implementation: `core/services/analytics_service.py`
  - Property ID: Configurable via `Config.GA_PROPERTY_ID` (default: 517047582)
  - Caching: Local cache at `secrets/ga_cache.json` with TTL configured by `GA_CACHE_LIFETIME_SECONDS`
  - Fallback: Mock data returned if credentials missing

**Search & Data:**
- DuckDuckGo Search API
  - SDK: `duckduckgo-search` (ddgs)
  - Use case: Semantic search capability in agent

**Make.com Integration:**
- Webhook triggering via `core/make_integration.py`
  - Function: `trigger_webhook(url, method, payload)`
  - Supports: POST and GET methods
  - Implementation: HTTP requests via `requests` library
  - Use case: Connect workflows to external automation platforms

**External HTTP Webhooks:**
- Social media publishing stubs in `core/integrations.py`
  - Function: `post_to_social(platform, content)`
  - Placeholder implementation (not integrated with real providers)

## Data Storage

**Databases:**
- SQLite (default)
  - Connection: File-based at `group_project_ai_ml.db` (configurable via `DATABASE_PATH`)
  - Client: Built-in `sqlite3` module with custom shim in `core/database.py`
  - Tables: users, workspaces, workflows, activity_logs, ai_chat_history, chat_sessions, chat_attachments
  - Schema migration: Manual SQL updates (no migration framework for SQLite)

- PostgreSQL (cloud-ready alternative)
  - Connection: Via `psycopg2` or `psycopg[binary]`
  - URL: Configurable via `POSTGRES_URL` environment variable or `secrets/database.json`
  - Activation: Set `USE_POSTGRES=true` or provide POSTGRES_URL in config
  - ORM: SQLAlchemy 2.0+ for abstraction layer in `database/progres.py`
  - Migration tool: Alembic for schema versioning
  - Shim: Custom PGShimConnection wraps psycopg2 to maintain SQLite-like API
  - Cloud platforms: Compatible with Railway, Neon, Render, Heroku PostgreSQL

**Vector Database:**
- ChromaDB - Semantic vector storage
  - Location: In-memory or persistent (default: in-process)
  - Use case: RAG embeddings, semantic search
  - Client: `chromadb` library
  - Integration: `ai_agent_service/core/knowledge.py`

**File Storage:**
- Local filesystem - Primary storage
  - Directories:
    - `uploads/` - User-uploaded files (images, documents)
    - `data/` - Training datasets (`DATASET-tung1000.csv`, product catalogs)
    - `saved_models/` - Trained model weights (LSTM, YOLO, layout detector)
    - `my_workflows/` - Saved workflow JSON files (auto-generated)
  - Workflow files: Named as `WF_{id}_{name}.json` in `my_workflows/` directory
  - Configuration: `dl_service/config.py` defines paths (UPLOAD_DIR, MODEL_DIR, DATA_DIR)

**Caching:**
- Google Analytics local cache
  - File: `secrets/ga_cache.json`
  - TTL: 3600 seconds (1 hour, configurable)
  - Format: JSON with timestamp and cached report data

- No Redis or distributed cache detected
- Session caching: Flask in-memory (via SECRET_KEY)

## Authentication & Identity

**Auth Provider:**
- Google OAuth2 via Authlib
  - Implementation: `core/google_integration.py` + `app.py` OAuth configuration
  - Token storage: `secrets/token.json` (user tokens), `secrets/token adminmail.json` (admin account)
  - Token refresh: Automatic refresh via google.auth.transport.requests.Request
  - Custom user model: UserMixin-based in `app.py`
  - Session management: Flask-Login with 7-day session lifetime

**Session Management:**
- Flask sessions with CSRF protection
  - Config:
    - `PERMANENT_SESSION_LIFETIME`: 7 days
    - `SESSION_REFRESH_EACH_REQUEST`: True
    - `WTF_CSRF_ENABLED`: True
    - `SESSION_COOKIE_SECURE`: False (HTTP in development)
  - CSRF token generation: Flask-WTF CSRFProtect middleware in `app.py`

**Password Management:**
- Bcrypt hashing via `passlib[bcrypt]`
  - Implementation: `core/database.py` hashes passwords with SHA256 (legacy) or bcrypt
  - Used for: Fallback local authentication if OAuth unavailable

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, LogRocket, or error tracking service configured

**Logs:**
- Console logging via Python's logging module
  - Framework logs: TensorFlow and Keras suppressed (TF_CPP_MIN_LOG_LEVEL='3')
  - Application logs: Print statements to stdout (reconfigured for UTF-8 on Windows)
  - Database activity: Logged in `core/database.py` (print statements for errors)
  - No persistent log storage detected

**Analytics:**
- Google Analytics integration (query-based, read-only)
  - Dashboard: `core/services/analytics_service.py` fetches reports
  - Metrics tracked: Daily active users, page views, traffic sources, top pages
  - No event tracking SDK detected

## CI/CD & Deployment

**Hosting:**
- Cloud-agnostic (Railway, Heroku, VPS compatible)
- Docker support (compose file previously present)
- Reverse proxy: Nginx expected (app.py uses ProxyFix middleware)

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or CI/CD workflow files present
- Git hooks: Directory `.git/hooks` present but empty

**Environment Configuration:**

**Required env vars:**
- `SECRET_KEY` - Flask secret (required for production)
- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- `POSTGRES_URL` - PostgreSQL connection string (required if using Postgres)
- `GA_PROPERTY_ID` - Google Analytics property ID (optional, has default)

**Optional env vars:**
- `USE_POSTGRES` - Switch to PostgreSQL (default: False for SQLite)
- `DATABASE_PATH` - SQLite file path (default: group_project_ai_ml.db)
- `SITE_DOMAIN` - Domain for app (default: auto-flowai.com)
- `BASE_URL` - Base URL for links (default: https://auto-flowai.com)
- `DL_SERVICE_URL` - Deep learning microservice URL (default: http://localhost:5001)
- `DL_SERVICE_TIMEOUT` - DL service call timeout in seconds (default: 30)
- `GA_CACHE_LIFETIME_SECONDS` - Analytics cache TTL (default: 3600)
- `OAUTHLIB_INSECURE_TRANSPORT` - Set to '1' for local OAuth over HTTP

**Secrets location:**
- Directory: `secrets/` (not committed to git, in `.gitignore`)
- Files:
  - `google_oauth.json` - OAuth credentials
  - `database.json` - PostgreSQL URL override
  - `analytics_service_account.json` - Google Analytics service account key
  - `token.json` - Cached user OAuth tokens
  - `token adminmail.json` - Admin account token
  - `ga_cache.json` - Cached analytics reports

## Webhooks & Callbacks

**Incoming:**
- Make.com webhooks via `trigger_webhook()` in `core/make_integration.py`
  - Pattern: Custom workflow triggers via Make.com automation platform
  - Authentication: Implicit (Make provides webhook URLs)

- Social media posting stubs (not implemented)
  - Placeholder: `core/integrations.py` function `post_to_social(platform, content)`

**Outgoing:**
- None detected at integration layer
- Application can receive data from external sources via API endpoints

## API Endpoints (Internal Services)

**Deep Learning Service (`dl_service/` on port 5001):**
- `POST /api/model1/detect` - Invoice layout detection and OCR
  - Input: Image file
  - Output: Extracted invoice data

- `POST /api/model2/forecast` - Quantity forecasting with LSTM
  - Input: Historical sales data
  - Output: Future quantity predictions

- `POST /api/ocr/` - Document OCR processing
  - Input: Image or PDF
  - Output: Extracted text

- `GET /api/history` - Invoice processing history
- `POST /api/history/clear` - Clear history

**AI Agent Service (`ai_agent_service/` on configurable port):**
- Memory management endpoints (via `core/memory.py`)
- Knowledge retrieval endpoints (via `core/knowledge.py`)
- Tool execution endpoints (via `core/tools.py`)
- Integration endpoints for external services

**Main Flask App (`app.py` on port 5000):**
- User authentication and session management
- Workflow CRUD operations
- Scenario management
- Chat interface with AI
- Analytics dashboard
- Admin controls

## Integration Patterns

**Microservice Communication:**
- DLClient in `core/services/dl_client.py` connects main app to DL service
  - Local mode: Direct Python function calls
  - Remote mode: HTTP calls to DL_SERVICE_URL
  - Timeout: Configurable (default 30 seconds)

**OAuth Token Lifecycle:**
- Get initial token: User redirects to Google OAuth
- Store token: Saved to `secrets/token.json`
- Refresh token: Automatic refresh when expired
- Use token: Passed to Google API calls

**Workflow Execution:**
- Workflow JSON stored in database and filesystem
- Execution engine: `core/workflow_engine.py`
- Supports: Google Sheets/Docs updates, Gmail sending, webhook triggers

---

*Integration audit: 2026-03-28*
