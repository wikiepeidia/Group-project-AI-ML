# Technology Stack

**Analysis Date:** 2026-03-28

## Languages

**Primary:**
- Python 3.x - Core backend, AI/ML services, workflow automation, model training
- HTML/CSS/JavaScript - Frontend templates in `ui/templates/`

**Secondary:**
- JSON - Configuration, data serialization, workflow definitions

## Runtime

**Environment:**
- Python (version not explicitly specified in lock file)
- Flask WSGI server with Werkzeug
- Node.js (minimal - `package.json` present but minimal dependencies)

**Package Manager:**
- pip (Python packages)
- npm (JavaScript - minimal usage, essentially empty `package.json`)
- No Python lock file detected (requirements.txt used directly)

## Frameworks

**Core Web:**
- Flask 3.0-3.x - Main web application framework in `app.py`
- FastAPI - Alternative async API framework in `ai_agent_service/` and `package/requirements.txt`
- Uvicorn - ASGI server for FastAPI
- Werkzeug - WSGI utilities, middleware, and request handling

**Security:**
- Flask-Login 0.6+ - User session and authentication management
- Flask-WTF 1.2+ - CSRF protection with CSRFProtect
- Flask-Talisman 1.1+ - Security headers (HSTS, CSP, X-Frame-Options)
- Flask-Limiter 3.5+ - Rate limiting
- authlib 1.x - OAuth2 client integration (`core/google_integration.py`)
- Passlib[bcrypt] - Password hashing with bcrypt algorithm

**AI/ML & Vision:**
- torch 2.4.0+ - PyTorch deep learning framework
- transformers 4.46.0+ - Hugging Face transformer models for NLP
- TensorFlow - Deep learning framework for LSTM models
- YOLO (via ultralytics) - Object detection for layout detection and invoice processing
- EasyOCR - Optical character recognition with deep learning
- PaddleOCR 2.6+ - Alternative OCR with PaddlePaddle backend
- PaddlePaddle 2.4.0+ - Core tensor computation for OCR
- pytesseract - Wrapper for Tesseract OCR engine
- timm - PyTorch Image Models for vision transformers
- einops - Einstein summation operations for tensor manipulation
- Florence-2 - Vision language model (components: timm, einops, pillow)

**RAG & Knowledge:**
- chromadb - Vector database for RAG (Retrieval-Augmented Generation)
- sentence-transformers - Semantic embedding generation
- sentence-piece - Tokenizer for transformer models

**Data Processing:**
- numpy 1.21.0+ - Numerical computing
- pandas - Data manipulation and analysis
- scikit-learn - Machine learning algorithms for preprocessing and metrics
- opencv-python-headless 4.5.0+ - Image processing (headless for servers)
- Pillow - Python imaging library
- pypdf - PDF document parsing and extraction
- python-docx - Microsoft Word (.docx) document parsing
- pdf2image - PDF to image conversion

**Server & Connectivity:**
- requests - HTTP client for external API calls
- pyngrok - Ngrok tunneling for local development exposure
- nest_asyncio - Async event loop support
- python-multipart - Multipart form data parsing for FastAPI

**Database & ORM:**
- SQLAlchemy 2.0+ - SQL ORM for database abstraction in `database/progres.py`
- psycopg2-binary / psycopg[binary] - PostgreSQL adapter for Python
- psycopg - Modern async-capable PostgreSQL driver (alternative)
- alembic - Database migration tool
- sqlite3 (built-in) - Fallback local database via Config.USE_POSTGRES switch

**Utilities & Tools:**
- json_repair - JSON malformed data recovery in `core/integrations.py`
- duckduckgo-search - Search engine API
- lunardate - Lunar calendar calculations
- pytz - Timezone handling
- python-dotenv - Environment variable loading (referenced in requirements)
- google-auth-oauthlib - Google OAuth2 authentication flow
- google-auth-httplib2 - Google API auth transport
- google-api-python-client - Google API client library
- google-analytics-data - Google Analytics Data API v1beta (BetaAnalyticsDataClient)
- addict / easydict - Attribute-accessible dictionaries

**Model Training & Acceleration:**
- accelerate 1.0.0+ - Distributed training utilities
- bitsandbytes 0.44.1+ - Quantization and low-bit operations
- protobuf - Protocol buffer serialization (required by transformers)

## Configuration

**Environment:**
- Configuration via environment variables in `core/config.py`:
  - `SECRET_KEY` - Flask session secret (defaults to insecure value in development)
  - `DATABASE_PATH` - SQLite database path (default: `group_project_ai_ml.db`)
  - `POSTGRES_URL` - PostgreSQL connection string (enables Postgres mode)
  - `USE_POSTGRES` - Boolean flag to switch database backend
  - `SITE_DOMAIN` - Domain configuration (default: `auto-flowai.com`)
  - `BASE_URL` - Base application URL
  - `GA_PROPERTY_ID` - Google Analytics property ID
  - `GA_CACHE_LIFETIME_SECONDS` - Analytics cache TTL
  - `DL_SERVICE_URL` - Deep learning service endpoint (default: `http://localhost:5001`)
  - `DL_SERVICE_TIMEOUT` - Timeout for DL service calls (default: 30s)
  - `OAUTHLIB_INSECURE_TRANSPORT` - Allow HTTP OAuth in development (set to '1')
  - `TF_CPP_MIN_LOG_LEVEL` - TensorFlow logging (set to '3' for silent mode)

**Secrets Loading:**
- Secrets from JSON files in `secrets/` directory:
  - `secrets/google_oauth.json` - Google OAuth client credentials (client_id, client_secret)
  - `secrets/database.json` - Database credentials (POSTGRES_URL override)
  - `secrets/analytics_service_account.json` - Google Analytics service account key
  - Fallback to environment variables if JSON files not found

**Build:**
- No explicit build configuration detected (Flask runs directly via `app.py`)
- Deep learning service runs via `dl_service/model_app.py` on separate port
- AI agent service runs via `ai_agent_service/server.py` or `main.py`

**Templates:**
- Flask templates in `ui/templates/` directory (referenced in `app.py` line 37)

## Platform Requirements

**Development:**
- Python 3.x with pip
- Git for version control
- System libraries:
  - Tesseract OCR engine (for pytesseract)
  - libopencv-dev or pre-compiled opencv-python-headless
  - CUDA/cuDNN (optional, for GPU acceleration with PyTorch/TensorFlow)

**Production:**
- Linux server (Ubuntu/Debian recommended for compatibility)
- Python 3.x runtime
- PostgreSQL database (Neon/Railway for cloud, local PostgreSQL for self-hosted)
- Reverse proxy: Nginx or similar (app.py uses ProxyFix middleware)
- Process manager: Gunicorn, uWSGI, or similar WSGI server
- GPU support optional (for accelerated inference)

**Deployment Target:**
- Railway or similar cloud platform (hints in recent commits reference Docker compose removal)
- Docker containerization (docker-compose.yml previously present, now deleted)
- Web: Flask/Uvicorn on port 5000 (main app), port 5001 (DL service)

## Key Characteristics

- **Multi-service architecture**: Main Flask app (`app.py`), separate deep learning service (`dl_service/`), separate AI agent service (`ai_agent_service/`)
- **Database flexibility**: Configurable SQLite or PostgreSQL backend via Config
- **OAuth2 integration**: Google authentication with scopes for Drive, Sheets, Gmail, Analytics
- **Computer vision pipeline**: YOLO + OCR + PaddleOCR for invoice/document processing
- **Vector search**: ChromaDB for semantic search and RAG
- **AI agents**: Multi-agent system with memory, knowledge, and tool execution
- **Automation**: Workflow engine for retail/supply chain automation

---

*Stack analysis: 2026-03-28*
