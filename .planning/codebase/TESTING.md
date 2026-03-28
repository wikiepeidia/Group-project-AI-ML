# Testing Patterns

**Analysis Date:** 2026-03-28

## Test Framework

**Runner:**
- pytest (no explicit config file, but test naming conventions follow pytest)
- unittest (Python standard library used in some cases)
- No test runner configuration detected (.pytest.ini or pytest.ini absent)

**Primary Testing Approach:**
- Script-based standalone tests (not integrated into a test framework)
- Manual/exploratory testing emphasis
- No automated CI/CD test pipeline detected

**Run Commands:**
```bash
# Manual test execution
python test/test_ai_service.py              # Connectivity tests
python test/test_db_connection.py           # Database tests
python dl_service/test/test_ood_detection.py  # ML model tests
python dl_service/test_ocr_pipeline.py      # OCR pipeline tests
```

**No centralized test command** — each test file is executed individually

---

## Test File Organization

**Location:**
- `test/` directory: General integration/connectivity tests
- `test/debug/` subdirectory: Debugging-focused tests
- `dl_service/test/` subdirectory: Deep learning model validation
- `dl_service/models/vietocr/vietocr/tests/` subdirectory: Vendor library tests

**Naming Conventions:**
- Files: `test_*.py` pattern (pytest-compatible)
- Test functions: `test_*()` pattern
- Integration tests: `test_ai_service.py`, `test_db_connection.py`
- Validation tests: `test_ood_detection.py` (comprehensive OOD detection suite)

**Example Structure:**
```
test/
├── debug/
│   ├── test_doc_node.py
│   ├── test_doc_to_sheet.py
│   ├── test_make_request.py
│   └── test_server_request.py
├── test_ai_service.py
├── test_db_connection.py
├── test_lstm_forecast.py
└── test_scenarios.py

dl_service/
├── test/
│   ├── test_ood_detection.py
│   └── test_vietocr.py
└── test_ocr_pipeline.py
```

---

## Test Structure

**Suite Organization Pattern:**

Observed structure from `dl_service/test/test_ood_detection.py`:

```python
def main():
    """Run all tests"""
    try:
        # Test 1: OOD Detectors
        test_ood_detectors()

        # Test 2: Uncertainty Estimation
        test_uncertainty_estimation()

        # Test 3: Fallback Strategies
        test_fallback_strategies()

        # Test 4: Decision Logic
        test_prediction_decision_logic()

        # Test 5: Integration
        run_integration_test()

        print("\n✅ ALL TESTS PASSED")
        return 0
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
```

**Setup and Teardown:**

Minimal formalized setup/teardown. Pattern observed:

```python
# Setup: data generation in test function
def simulate_model_data():
    """Simulate feature outputs from your LSTM model"""
    n_train = 200
    train_features = np.random.randn(n_train, 64) * 0.5
    return train_features, test_id_features, test_ood_features

# Usage in test
def test_ood_detectors():
    train_features, test_id_features, test_ood_features = simulate_model_data()
    # test logic
```

**Try-catch pattern for robustness:**

```python
for product in products:
    try:
        # operation
        result = process(product)
    except ValidationError as e:
        print(f"❌ Validation Failed: {e}")
    except Exception as e:
        print(f"ERROR: {e}")
        results[method] = None
```

---

## Test Types

**Unit Tests:**
- Scope: Individual functions or small components
- Approach: Direct function calls with test data
- Example: `test_ood_detectors()` tests OODDetector class methods
- Location: `dl_service/test/test_ood_detection.py` lines 48–131
- Pattern: Call method → collect metrics → assert expectations

```python
def test_ood_detectors():
    detector = OODDetector(method='msp', threshold=0.5)
    detector.fit(train_features)
    id_scores = detector.score(test_id_features)
    metrics = detector.evaluate(id_scores, ood_scores)
    assert metrics['auroc'] > 0.75  # implicit assertion
```

**Integration Tests:**
- Scope: Multiple components working together
- Approach: End-to-end pipeline validation
- Example: `run_integration_test()` in `test_ood_detection.py` (lines 261–308)
- Pattern: Simulate realistic scenario → run pipeline → verify behavior

```python
def run_integration_test():
    """Simulated integration test with realistic scenario"""
    products = [...]  # realistic data
    for product in products:
        # Process through LSTM → OOD detection → fallback decision
        # Verify prediction method chosen correctly
```

**Connectivity/API Tests:**
- Scope: External service availability
- Location: `test/test_ai_service.py`
- Pattern: Make HTTP request → validate response

```python
def test_ai_chat():
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    assert response.status_code == 200
    print("✅ AI Service connection successful!")
```

**Database Connection Tests:**
- Scope: Database availability and query execution
- Location: `test/test_db_connection.py`
- Pattern: Establish connection → execute queries → verify schema

```python
def test_connection():
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM users")
```

**E2E Tests:**
- Framework: Not formally used (no Playwright, Cypress, or Selenium config detected)
- Manual testing emphasis observed in project structure

---

## Data Setup & Fixtures

**Test Data Generation:**

```python
def simulate_model_data():
    """
    Simulate feature outputs from your LSTM model
    In practice: features = model.layers[-3].output (hidden state)
    """
    # Training features (ID distribution)
    n_train = 200
    train_features = np.random.randn(n_train, 64) * 0.5

    # Test ID features
    n_test_id = 50
    test_id_features = np.random.randn(n_test_id, 64) * 0.5

    # Test OOD features (different distribution)
    n_test_ood = 30
    test_ood_features = np.random.randn(n_test_ood, 64) * 2.0 + 2.0

    return train_features, test_id_features, test_ood_features
```

**Test Case Data:**

```python
test_cases = [
    {
        'name': 'Known Product (High Confidence)',
        'lstm_pred': 5000,
        'ood_score': 0.2,
        'confidence': 0.92,
        'uncertainty': 150,
    },
    {
        'name': 'Unknown Product (Low Confidence)',
        'lstm_pred': 1200,
        'ood_score': 0.88,
        'confidence': 0.25,
        'uncertainty': 800,
    },
]
```

**Fixture Location:**
- In-function data generation (no separate fixtures directory)
- Test helper functions: `simulate_model_data()`, `generate_test_cases()`
- Configuration files: `secrets/ai_config.json` (for API tests)

---

## Assertion Patterns

**Implicit Assertions (Print-based validation):**

```python
# Test outputs metrics and checks them visually
print(f"AUROC:           {metrics['auroc']:.4f}")
assert auroc > 0.75, "Expected AUROC > 0.75"  # implicit/manual check

# Print-based decision
if auroc > 0.85 and fpr < 0.15:
    status = "✅ EXCELLENT"
else:
    status = "⚠ FAIR"
```

**Status Code Assertions:**

```python
if response.status_code == 200:
    print("\n✅ AI Service connection successful!")
else:
    print("\n❌ AI Service returned an error.")
```

**Exception-based Assertions:**

```python
try:
    detector = OODDetector(method=method)
    # ... process ...
except Exception as e:
    print(f"ERROR: {e}")
    results[method] = None
```

**Numeric Assertions (for ML metrics):**

```python
# Detect rate calculation
detected_ood = np.sum(ood_scores > metrics['best_threshold'])
detection_rate = detected_ood / len(ood_scores)
print(f"Detection Rate:  {detection_rate * 100:.1f}%")
# Success measured by rate > some threshold
```

---

## Mocking

**Framework:**
- `unittest.mock` (Python standard library)
- Direct stub implementations (more common)

**Mocking Pattern (Stub):**

Test files often mock or stub external dependencies:

```python
# From test_db_connection.py
try:
    db = Database()
    conn = db.get_connection()
except Exception as e:
    # If DB unavailable, test can continue with mocked behavior
    print("Using mock database")
```

**What to Mock:**
- External API calls (use local test endpoints)
- Database connections (use SQLite in-memory for tests)
- ML models (use smaller test models)
- File I/O (use temporary files via `tempfile`)

**What NOT to Mock:**
- Core business logic (test the actual implementation)
- Data validation (test real validation rules)
- Error paths (test actual exception handling)

**Example from Vision Agent Test:**

```python
def test_vision_agent():
    # Don't mock: core vision inference
    # Do mock: model loading from HF (can use cached weights)
    vision = VisionAgent()
    result = vision.analyze_image("test_image.jpg")
```

---

## Test Execution Examples

**Test: OOD Detection Suite**

Location: `dl_service/test/test_ood_detection.py`

Run:
```bash
python dl_service/test/test_ood_detection.py
```

Output pattern:
```
===============================================================================
OOD DETECTION TEST SUITE
===============================================================================

[Test 1 output]
[Test 2 output]
[Test 3 output]

===============================================================================
✅ ALL TESTS PASSED
===============================================================================
```

**Test: API Connectivity**

Location: `test/test_ai_service.py`

Run:
```bash
python test/test_ai_service.py
```

Output pattern:
```
Testing AI Chat Service connectivity...
Target URL: https://...
Status Code: 200
Response: {"status": "success", ...}

✅ AI Service connection successful!
```

**Test: Database Connection**

Location: `test/test_db_connection.py`

Run:
```bash
python test/test_db_connection.py
```

Output pattern:
```
========================================
DATABASE CONNECTION TEST
========================================
[1] Database Class Instantiated
[2] Connection Successful
[3] Checking SQLite Version...
[5] Verifying Tables...
[6] Connection Closed
```

---

## Coverage

**Requirements:** No explicit coverage target enforced

**View Coverage:** Not configured

**Note:** Coverage analysis tools (pytest-cov, coverage.py) not detected in codebase

**Current State:** Tests are validation-focused rather than coverage-driven. Most tests print pass/fail status but don't measure % of code covered.

---

## Async Testing

**Framework:** No explicit async test framework detected

**Pattern:** FastAPI/Uvicorn tests use `async def` route handlers

```python
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    # async handler
    pass
```

**Manual Testing:** Async operations tested via HTTP requests to running server:

```python
response = requests.post(url, json=payload, timeout=10)
```

---

## Error/Exception Testing

**Pattern 1: Try-catch with assertions**

```python
try:
    # operation that might fail
    detector = OODDetector(method=method)
    detector.fit(train_features)
    # if no exception, test passes
except Exception as e:
    print(f"ERROR: {e}")
    results[method] = None  # mark failure
```

**Pattern 2: Specific exception validation**

```python
from utils.validators import ValidationError

try:
    validate_image_file(file)
except ValidationError as e:
    print(f"✓ Validation correctly rejected: {e}")
```

**Pattern 3: Expected exceptions**

```python
# Test that OOD detection correctly identifies outliers
test_ood_features = np.random.randn(30, 64) * 2.0 + 2.0  # outlier distribution
ood_scores = detector.score(test_ood_features)
# Expect high OOD scores (implicit assertion via next check)
detected = np.sum(ood_scores > threshold)
assert detected / len(ood_scores) > 0.8  # Most should be detected as OOD
```

---

## Testing Best Practices in This Codebase

**1. Clear Test Names:**
- `test_ood_detectors()` - clearly states what's tested
- `run_integration_test()` - indicates full pipeline
- `test_prediction_decision_logic()` - specific scenario

**2. Descriptive Output:**
```python
print("=" * 70)
print("OOD DETECTION TEST SUITE")
print("=" * 70)
```

**3. Section-based Organization:**
```python
print("\n" + "-" * 70)
print("Method: MHALANOBIS")
print("-" * 70)
# Test that specific method
```

**4. Tabular Results:**
```python
print(f"{'Method':<15} {'AUROC':<10} {'FPR@95%TPR':<12} {'Status':<15}")
print("-" * 70)
for method, metrics in results.items():
    print(f"{method:<15} {auroc:<10.4f} {fpr:<12.4f} {status:<15}")
```

**5. Realistic Scenario Testing:**
```python
products = [
    {'name': 'Coca Cola', 'in_training': True, 'sales_history': [1000, 1100, 1050]},
    {'name': 'Unknown Brand X', 'in_training': False, 'sales_history': []},
]
# Test each product type
```

---

## Test File Locations (Quick Reference)

**AI Service Tests:**
- `test/test_ai_service.py` - Chat endpoint connectivity
- `test/test_db_connection.py` - Database setup
- `test/test_scenarios.py` - Multi-agent scenarios

**Deep Learning Tests:**
- `dl_service/test/test_ood_detection.py` - OOD detector validation (comprehensive)
- `dl_service/test_ocr_pipeline.py` - OCR pipeline end-to-end
- `dl_service/test_vietocr.py` - ViETOCR model

**Debug Tests:**
- `test/debug/test_doc_node.py` - Document tree nodes
- `test/debug/test_make_request.py` - HTTP request handling
- `test/debug/test_sheet_write.py` - Google Sheets integration

---

## Common Testing Gaps

**Not Tested:**
- UI/Frontend components (no Playwright E2E tests)
- API response schema validation (some implicit)
- Concurrent request handling
- Memory leak detection in long-running processes
- Vision model edge cases (blurry, rotated, etc.)

**Recommendation:** Add pytest-based parametrized tests for better organization and CI integration.

---

*Testing analysis: 2026-03-28*
