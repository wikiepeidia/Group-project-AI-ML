# Architecture

**Analysis Date:** 2026-03-28

## Pattern Overview

**Overall:** Microservices with Monolithic Main Application

This is a hybrid architecture combining:
- A main Flask monolith (`app.py`) serving as the web application and orchestration layer
- A separate Deep Learning microservice (`dl_service/model_app.py`) running independently on port 5001
- An AI Agent service (`ai_agent_service/`) that provides autonomous agent capabilities
- Workflow engine for connecting multiple services and automating business processes

**Key Characteristics:**
- Python-based Flask web application (main entry point)
- Asynchronous job processing with in-memory job store for AI tasks
- Multi-service architecture with HTTP-based communication between services
- Supports both local execution (direct Python imports) and remote HTTP calls
- OAuth2 integration with Google for authentication and API access
- Templated HTML UI with server-side rendering
- Workflow engine for orchestrating multi-step data processing pipelines

## Layers

**Presentation Layer (Flask Web Server):**
- Purpose: Serve web UI with server-side rendered templates, handle user sessions, manage authentication
- Location: `ui/templates/` (HTML templates), `app.py` (Flask application setup)
- Contains: Jinja2 templates for admin dashboard, user management, product/customer views, analytics
- Depends on: Authentication layer, database layer, core services
- Used by: Web browsers, API clients (authenticated)

**API Layer (Blueprint Routes):**
- Purpose: Handle HTTP requests and responses, route requests to appropriate handlers
- Location: Routes defined inline in `app.py` using Flask blueprints (imported but executed in main app)
- Contains: Route handlers for authentication, user management, dashboard, workflows, integrations
- Depends on: Core services, database, authentication managers
- Used by: Frontend templates, external API clients

**Service Layer (Core Business Logic):**
- Purpose: Implement domain-specific logic - authentication, data processing, workflow execution, analytics
- Location: `core/` directory
- Contains:
  - `core/database.py` - Database abstraction layer with connection pooling and schema management
  - `core/auth.py` - User authentication and password management (hash-based)
  - `core/config.py` - Configuration management and environment variables
  - `core/workflow_engine.py` - Workflow execution engine with topological sort for node dependencies
  - `core/automation_engine.py` - Business automation logic
  - `core/google_integration.py` - Google Drive, Sheets, Docs, Gmail, Analytics integrations
  - `core/agent_middleware.py` - Middleware for AI agent request handling
  - `core/services/dl_client.py` - Client for calling the Deep Learning microservice
  - `core/services/analytics_service.py` - Analytics and tracking
- Depends on: Database, external APIs (Google, Make.com webhooks)
- Used by: API layer, workflows

**Data Layer (Database):**
- Purpose: Persistent data storage and retrieval
- Location: `database/` directory with schema and utilities
- Contains:
  - SQLite database (default) with fallback support for PostgreSQL
  - Mock data for development in `database/mock/`
  - Database initialization and migration logic
- Depends on: None
- Used by: All service layers

**Microservice Layer (Deep Learning Service):**
- Purpose: Computer vision and NLP model inference for document processing
- Location: `dl_service/` directory
- Contains:
  - `dl_service/model_app.py` - Flask microservice entry point
  - `dl_service/models/` - Pre-trained ML models (YOLO, LSTM, VietOCR)
  - `dl_service/services/` - Model inference services
  - `dl_service/api/` - Blueprint routes for model endpoints
  - `dl_service/database/` - Local database for inference history
- Depends on: TensorFlow, OpenCV, PyTorch
- Used by: Main application via `DLClient`, direct HTTP calls to port 5001

**AI Agent Service (Autonomous Agents):**
- Purpose: Provide autonomous agent capabilities for complex task automation
- Location: `ai_agent_service/` directory
- Contains:
  - `ai_agent_service/main.py` - Main entry point
  - `ai_agent_service/server.py` - Server implementation
  - `ai_agent_service/agents/` - Individual agent implementations
  - `ai_agent_service/core/` - Core agent infrastructure
  - `ai_agent_service/tools/` - Tool definitions for agent use
  - `ai_agent_service/models/` - Fine-tuned language models
- Depends on: LLM libraries, tools, data schemas
- Used by: Main application for complex automation workflows

**Utility Layer:**
- Purpose: Shared utilities and helpers
- Location: `core/utils.py`, `dl_service/utils/`, error handlers throughout
- Contains: Helper functions for datetime handling, error formatting, data validation
- Depends on: None
- Used by: All layers

## Data Flow

**User Authentication Flow:**

1. User submits login form → `app.py` route handler
2. `AuthManager.verify_user()` → queries `users` table in database
3. Password verified with SHA256 hash
4. Session created with Flask-Login, stored in memory
5. User redirected to dashboard with session cookie

**Google OAuth Flow:**

1. User clicks "Login with Google" → Flask OAuth handler
2. Authlib redirects to Google OAuth consent screen
3. Google returns authorization code → `app.py` callback
4. Exchange code for access token
5. Store `google_token` in user record
6. Session established, user redirected to dashboard

**Workflow Execution Flow:**

1. User creates/loads workflow JSON in UI
2. POST request to `/api/workflow/execute` endpoint
3. `core/workflow_engine.py` receives workflow definition
4. `topological_sort()` orders nodes by dependencies
5. For each node in order:
   - Resolve template variables using `resolve_template()` from output of previous nodes
   - Execute node (could be: data fetch, ML model call, Google integration, Make webhook, etc.)
   - Store result in execution context
6. Return aggregated results to client
7. Results can be visualized in UI or exported

**Document Processing (Invoice) Flow:**

1. User uploads image file → `POST /api/invoice/upload`
2. Route handler calls `DLClient.detect_invoice(file_bytes=...)`
3. DLClient converts to OpenCV format and calls `dl_service/services/invoice_service.py`
4. YOLO model detects layout regions (invoice, table, fields)
5. Detected regions passed to VietOCR model for text extraction
6. OCR results returned as structured data (amounts, dates, items)
7. Results stored in invoice history table
8. User can forecast quantities using LSTM model
9. Forecast results displayed in dashboard

**Deep Learning Service Request:**

1. Main app calls `DLClient.detect_invoice()` or `DLClient.forecast_quantity()`
2. DLClient checks `use_local` flag:
   - If `True`: Direct Python function call (faster, same process)
   - If `False`: HTTP POST to `http://localhost:5001/api/model1/detect`
3. DL service processes request:
   - Model inference on GPU/CPU
   - Results formatted and returned
4. Main app receives response and processes further if needed

**Google Integration Flow (Sheets/Drive/Gmail):**

1. Workflow node has Google action (read sheet, upload document, send email)
2. `core/google_integration.py` called with user's `google_token`
3. Token verified and refreshed if needed
4. Google API call made with appropriate scopes
5. Result cached or stored
6. Return to workflow context

**Analytics Event Flow:**

1. User action triggers analytics event (e.g., document processed, workflow executed)
2. `core/services/analytics_service.py` logs event with timestamp, user ID, event type
3. Event stored in local database or sent to analytics service
4. Dashboard aggregates events for user/admin analytics views

**Asset Upload Flow:**

1. User selects file (image, document, etc.) in UI
2. File sent via multipart form data to `/upload` endpoint
3. File saved to `jobs/` or appropriate upload directory
4. Return file path/URL to client
5. Path can be used in subsequent workflow nodes

## Key Abstractions

**Database Abstraction:**
- Purpose: Unified interface for SQLite and PostgreSQL databases
- Examples: `core/database.py` with `Database` class
- Pattern: Cursor-based interface with compatibility shims for different DB engines
- Handles: Connection pooling, schema introspection, query parameter conversion

**DLClient (Microservice Client):**
- Purpose: Abstract away the complexity of calling the DL service
- Examples: `core/services/dl_client.py`
- Pattern: Supports both local execution (direct imports) and remote HTTP calls
- Handles: Request/response serialization, error handling, timeout management

**Workflow Engine:**
- Purpose: Execute complex multi-step workflows as DAGs (Directed Acyclic Graphs)
- Examples: `core/workflow_engine.py` with `execute_workflow()` function
- Pattern: Topological sort → node iteration → context passing
- Handles: Template variable resolution, node type dispatch, error propagation

**AuthManager:**
- Purpose: Centralized authentication logic
- Examples: `core/auth.py` with `AuthManager` class
- Pattern: Database-backed user credentials, password hashing, session management
- Handles: User registration, login verification, password reset

**GoogleIntegration Module:**
- Purpose: Encapsulate all Google API interactions
- Examples: `core/google_integration.py`
- Pattern: Functions for each operation (read_sheet, write_doc, send_email, etc.)
- Handles: Token management, API error handling, scope management

## Entry Points

**Main Web Application:**
- Location: `app.py`
- Triggers: `python app.py` or `flask run`
- Responsibilities:
  - Initialize Flask application with configuration
  - Set up security middleware (Talisman, CSRF, rate limiting)
  - Configure OAuth2 with Google
  - Initialize core components (database, auth, automation engine)
  - Register route handlers
  - Start HTTP server on port 5000 (default)

**Deep Learning Microservice:**
- Location: `dl_service/model_app.py` (executed via `run_dl_service.py`)
- Triggers: `python run_dl_service.py`
- Responsibilities:
  - Initialize Flask app with model loading service
  - Load pre-trained ML models from disk
  - Register API blueprint routes for model endpoints
  - Initialize local database for inference history
  - Start HTTP server on port 5001

**AI Agent Service:**
- Location: `ai_agent_service/main.py` or `ai_agent_service/server.py`
- Triggers: `python ai_agent_service/main.py`
- Responsibilities:
  - Initialize agent infrastructure
  - Load agent definitions from `data/blueprints/`
  - Start service (depends on implementation)

## Error Handling

**Strategy:** Try-catch with context-specific error responses

**Patterns:**
- Database errors: Log, return 500 with generic message to client
- Validation errors: Return 400 with specific field/issue
- Authentication errors: Return 401 with redirect to login
- DL service unavailable: Fallback to alternate implementation or queue for retry
- OAuth errors: Log, return error message with retry option
- Workflow execution errors: Capture error in execution context, allow partial results

**Examples:**
- `app.py` routes wrap business logic in try-except
- `core/database.py` connection errors logged with traceback
- `core/services/dl_client.py` catches `RequestException` and returns error dict
- OAuth callback checks for error parameter from Google

## Cross-Cutting Concerns

**Logging:**
- Console output via print() statements (not production-ready)
- File logging to `api_log.txt` in `ai_agent_service/`
- Structured logging for errors with context

**Validation:**
- Database schema validation in `Database.init_database()`
- User input validation in route handlers (form data, JSON)
- File type/size validation for uploads
- Workflow template validation before execution

**Authentication:**
- Session-based via Flask-Login for web UI
- Google OAuth for third-party integration
- API calls require valid session or Google token
- Role-based access control (admin, manager, user roles)

**Rate Limiting:**
- Flask-Limiter configured with per-day and per-hour limits
- Disabled in development mode (`RATELIMIT_ENABLED=False`)
- Can be customized per-endpoint

**CSRF Protection:**
- Flask-WTF CSRF protection enabled
- CSRF tokens generated and validated on forms and API calls
- Talisman CSP policy configured (permissive for development)

**Security Headers:**
- Talisman middleware applies security headers
- HSTS enabled
- Frame options set to DENY
- Content-Type sniffing prevented

---

*Architecture analysis: 2026-03-28*
