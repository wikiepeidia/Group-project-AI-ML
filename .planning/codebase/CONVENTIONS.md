# Coding Conventions

**Analysis Date:** 2026-03-28

## Language Patterns

**Primary Language:** Python (AI agent service, DL service, backend)

**Secondary:** JavaScript/TypeScript (minimal presence, package.json empty)

**Python Version:** 3.8+ (based on syntax and imports)

---

## Naming Patterns

**Files:**
- snake_case for Python files: `base.py`, `engine.py`, `memory.py`
- Lowercase with underscores for modules: `agent_middleware.py`, `invoke_training_data.py`
- API routes use underscores: `model1_routes.py`, `ocr_routes.py`
- Blueprint/service files follow pattern: `invoice_service.py`, `forecast_service.py`

**Functions:**
- snake_case: `clean_output()`, `extract_json_block()`, `analyze_task()`
- Private methods prefixed with underscore: `_initialize()`, `_get_active_session()`, `_get_workflow_tools()`
- Description-based naming: `process_invoice_image()`, `validate_image_file()`, `save_invoice_to_db()`

**Variables:**
- snake_case for regular variables: `user_input`, `model_engine`, `vision_context`
- Uppercase for constants and config values: `PROJECT_ROOT`, `DATA_DIR`, `SYSTEM_CONTEXT`, `ALLOWED_EXTENSIONS`, `UPLOAD_DIR`
- Environment variables uppercase: `DATABASE_URL`, `HF_BASE_URL`, `HF_TOKEN`, `SECRET_KEY`
- Single letter variables acceptable for iterations: `i`, `m` (in loops)

**Classes:**
- PascalCase: `BaseAgent`, `ModelEngine`, `MemoryManager`, `ManagerAgent`, `VisionAgent`, `CoderAgent`
- Service classes: `DLClient`, `AutomationEngine`, `Database`, `Config`
- Blueprint objects lowercase with `_bp` suffix: `model1_bp`, `ocr_routes`

**Type hints:**
- Not extensively used (older codebase patterns)
- When present, follow Python standard: `def analyze_task(self, clean_text: str):`

---

## Code Style

**Formatting:**
- No explicit formatter detected (no .prettierrc, .eslintrc, or setup.cfg)
- Observed style: 4-space indentation (Python standard)
- Line breaks between methods and logical sections
- Comments use `#` (Python standard)
- docstrings use triple quotes: `"""Test & Evaluate OOD Detection..."""`

**Import Organization:**

Standard order observed:
1. Standard library imports (`sys`, `os`, `json`, `time`, `threading`)
2. Third-party imports (`torch`, `fastapi`, `flask`, `requests`)
3. Local imports (from `src.`, `core.`, relative paths)

Example from `ai_agent_service/server.py`:
```python
import sys
import os
import json
import re
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.core.engine import ModelEngine
from src.core.memory import MemoryManager
from src.agents.manager import ManagerAgent
```

**Path Aliases:**
- Absolute imports from `src.` prefix used: `from src.core.engine import ModelEngine`
- Root-relative imports in some legacy code: `from core.config import Config`
- No explicit path alias configuration file detected

---

## Error Handling

**Patterns Observed:**

1. **Bare try-except (common):**
```python
try: engine = ModelEngine()
except: pass  # Silent failure
```

2. **Try-except with logging:**
```python
try:
    db = Database()
    # operation
except Exception as e:
    logger.error(f"Failed to process: {e}")
```

3. **Try-finally (for resource cleanup):**
```python
try:
    # processing
finally:
    try: os.unlink(tmp.name)
    except: pass
```

4. **Exception with traceback:**
```python
except Exception as e:
    print(f"\n❌ TEST FAILED: {e}")
    import traceback
    traceback.print_exc()
```

5. **Custom exceptions (minimal usage):**
```python
from utils.validators import ValidationError
raise ValidationError('No file provided. Please upload an image.')
```

**Error Logging:**
- Uses custom logger: `logger = get_logger(__name__)` (from `utils.logger`)
- Format: `logger.info()`, `logger.warning()`, `logger.error()`
- Print statements in main/CLI code: `print(f"❌ Error: {e}")`
- Emoji prefixes in user-facing output: `❌`, `✅`, `⚠️`, `👁️`

**Guidelines:**
- Avoid bare `except:` clauses (some exist in legacy code — avoid replicating)
- Always log or print errors, never silently fail
- Use specific exception types when possible

---

## Logging

**Framework:** Custom logger utility and print statements

**Logger Setup:**
```python
from utils.logger import get_logger
logger = get_logger(__name__)
```

**Usage Patterns:**
```python
logger.info(f"Processing invoice image: {file.filename}")
logger.warning(f"Failed to save invoice to database: {db_error}")
logger.error(f"Critical error occurred: {e}")
```

**Print-Based Logging (in CLI/main code):**
- Status messages: `print("✅ Ready.")`
- Errors: `print(f"❌ Error: {e}")`
- Progress: `print("    [Vision] Analyzing...")`
- Section headers: `print("=" * 70)`

**Patterns:**
- Use f-strings for formatting: `f"Processing {file.filename}"`
- Include timestamps where needed (database updates do CURRENT_TIMESTAMP)
- Log request duration: `duration = (time.time() - start_time) * 1000`

---

## Comments

**When to Comment:**
- Complex algorithms or non-obvious logic
- Workarounds and fixes: `# FIX: attn_implementation="eager" fixes the _supports_sdpa crash on newer transformers`
- Section headers in long functions: `# --- 0. VISION CHECK ---`
- Configuration explanations: `# Give 50% (40GB) to the 32B model`

**Docstrings:**
- Used for function/class documentation (not consistently)
- Format: triple-quoted strings at top of function
```python
def test_ood_detectors():
    """Test all OOD detection methods"""
```

**JSDoc/TSDoc:**
- Not applicable (Python-first codebase)

**Avoided:**
- No commented-out code should be committed (common pattern: deletion)
- Avoid TODO comments in production code (track in TODO.md instead)

---

## Function Design

**Size Guidelines:**
- Range: 10–50 lines typical
- Simple utilities: 5–15 lines
- Complex logic (agents): 30–60 lines acceptable
- Longer functions (100+ lines) found in test suites (intentional)

**Parameters:**
- 3–5 parameters typical
- Use kwargs for optional parameters: `def generate(self, prompt: str, **kwargs):`
- Dataclass/Pydantic models for multiple parameters
```python
class ChatRequest(BaseModel):
    user_id: int
    store_id: int
    message: str
```

**Return Values:**
- Single value typical: `return text.strip()`
- Tuple returns for status + data: `status, data = resolver.resolve_login(CURRENT_USER_ID)`
- Dictionary returns for complex results: `return {"category": "TECHNICAL"}`
- Always return something meaningful; avoid silent None returns

---

## Module Design

**Exports:**
- Typically one main class per module
- Example: `base.py` exports `BaseAgent`, `engine.py` exports `ModelEngine`
- Services may have multiple functions: `utils/logger.py` exports `get_logger()`, `log_api_request()`

**Barrel Files:**
- Minimal usage (no `__init__.py` with re-exports observed)
- Blueprint registration done in main app: `from api.model1_routes import model1_bp`

**Singleton Pattern:**
- Used for `ModelEngine`: `_instance` class variable with `__new__` override
```python
class ModelEngine:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
```

**Dependency Injection:**
- Constructor injection common: `def __init__(self, engine: ModelEngine, memory: MemoryManager):`
- Agents receive engine and memory: `manager = ManagerAgent(engine, memory, kb=kb)`

**Module Cohesion:**
- Agent modules tightly focused: `CoderAgent` handles code generation only
- Service modules: `invoice_service.py` handles invoice processing pipeline
- Utilities isolated: `utils/validators.py`, `utils/logger.py`, `utils/database.py`

---

## String Formatting

**F-strings (preferred):**
```python
print(f"Processing {file.filename}")
user_msg = f"📥 User: '{user_msg}'"
prompt = f'''<|im_start|>system
{context}
<|im_end|>'''
```

**Format method (legacy):**
```python
print("{} - {}".format(status, duration))
```

**Avoid:**
- % formatting (old style)
- Concatenation with `+`

---

## Configuration Management

**Config Class Pattern:**
- Centralized in `Config` class: `src/core/config.py`, `dl_service/config.py`
- Environment variable loading: `os.getenv("DATABASE_URL", "default_value")`
- URL transformation for database compatibility:
```python
if raw_url.startswith("postgres://"):
    self.DB_URL = raw_url.replace("postgres://", "postgresql+psycopg2://")
```
- Constants as class attributes (not dict):
```python
class Config:
    DOCS_DIR = os.path.join(self.DATA_DIR, 'docs')
    SYSTEM_CONTEXT = "You are Project A, a Retail Automation Architect."
```

**No hardcoded secrets:**
- API keys loaded from env vars: `token = config.get('HF_TOKEN')`
- Secrets in files listed but not accessed: `secrets/google_oauth.json` loaded conditionally
- Feature flags via env: `USE_POSTGRES = getattr(Config, 'USE_POSTGRES', False)`

---

## Multi-line Strings

**Prompt Templates:**
```python
prompt = f'''<|im_start|>system
You are the Automation Engine.
...
<|im_end|>
<|im_start|>user
{task}
<|im_end|>'''
```

**Triple-quoted strings with indentation:**
```python
def test_function():
    """
    Long docstring explaining
    the function behavior across
    multiple lines.
    """
```

---

## Code Organization by Feature

**Example: Agent Pattern**
- Base class: `agents/base.py` - defines interface
- Concrete agents: `agents/manager.py`, `agents/coder.py`, `agents/vision.py`
- Engine shared: `core/engine.py` - passed to agents
- Memory shared: `core/memory.py` - passed to agents

**Example: API Route Pattern**
- Blueprint setup: `api/model1_routes.py`
- Service logic: `services/invoice_service.py`
- Utilities: `utils/validators.py`, `utils/database.py`
- Main app: `app.py` or `server.py` registers blueprints

---

## Common Antipatterns (Avoid)

1. **Bare except clauses:**
```python
except: pass  # ❌ Don't do this
```
Better:
```python
except Exception as e:
    logger.error(f"Failed: {e}")
```

2. **Silent failures in main flow:**
```python
try: engine = ModelEngine()
except: pass  # Sets engine to None silently
```
Better:
```python
try:
    engine = ModelEngine()
except Exception as e:
    logger.error(f"Engine failed to initialize: {e}")
    engine = None
```

3. **Hardcoded paths:**
```python
model_path = "C:\\Users\\...\model.bin"  # ❌
```
Better:
```python
model_path = os.path.join(self.config.DATA_DIR, "models", "model.bin")
```

4. **No type hints (acceptable for legacy, but add them to new code):**
```python
def process_invoice_image(image):  # Missing type hint
```
Better:
```python
def process_invoice_image(image: np.ndarray) -> dict:
```

---

*Convention analysis: 2026-03-28*
