# Integration Plan: Merging Workflow Engine into Main App

This document outlines the steps to integrate the standalone `workflow_engine` (currently in `test/`) into the main application (`app.py`).

## 1. File Migration Structure

We will move the tested files into the `core/` directory to maintain a clean architecture.

| Source (Test) | Destination (Prod) | Purpose |
| :--- | :--- | :--- |
| `test/workflow_engine.py` | `core/workflow_engine.py` | The main logic for executing DAGs. |
| `test/google_integration.py` | `core/google_integration.py` | Handles Google API calls (Sheets, Docs, Gmail). |
| `test/make_integration.py` | `core/make_integration.py` | Handles Webhooks (Make, Slack, Discord). |
| `test/token.json` | `secrets/token.json` | **CRITICAL**: The user's OAuth token. |
| `test/client_secret.json` | `secrets/client_secret.json` | The App's credentials. |

## 2. Backend Integration (`app.py`)

We need to add the API endpoint that the frontend calls to execute workflows.

### Step A: Imports

Add these imports to `app.py`:

```python
from core.workflow_engine import execute_workflow
```

### Step B: API Endpoint

Add this route to `app.py` (protected by `@login_required`):

```python
@app.route('/api/workflow/execute', methods=['POST'])
@login_required
@csrf.exempt # Workflows might be complex, exempting CSRF for API call if needed, or ensure token is passed
def run_workflow():
    try:
        workflow_data = request.json
        # Optional: Inject current_user info into context if needed
        result = execute_workflow(workflow_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
```

## 3. Frontend Integration

We need to move the Builder UI from `test/testworkflow.html` into the main application's template structure.

### Step A: Create Template

Copy `test/testworkflow.html` to `ui/templates/workspace_builder.html`.

* *Modification*: Ensure it extends `base.html` if you want the sidebar/header.
* *Modification*: Update the `fetch` URL from `/api/execute` to `/api/workflow/execute`.

### Step B: Route

Ensure `app.py` has a route to serve this page:

```python
@app.route('/workspace/builder')
@login_required
def workspace_builder():
    return render_template('workspace_builder.html')
```

## 4. Authentication Handling (The Tricky Part)

Currently, `google_integration.py` looks for `token.json` on the disk. In a multi-user production app, **every user needs their own token**.

### Proposed Solution (MVP)

For now, we will keep it simple (Single Tenant Mode) as per your current setup:

1. The app uses **one** `secrets/token.json` (the one you just generated).
2. This means the app acts as a "Service Bot" that performs actions on behalf of *you* (the admin), regardless of who clicks the button.

### Future Upgrade (Multi-User)

To support multiple users logging in with *their own* Google accounts:

1. We need to store `token.json` content in the `users` database table (column: `google_token`).
2. Modify `google_integration.py` to accept a `token` argument instead of reading a file.
3. Pass `current_user.google_token` from `app.py` into `execute_workflow`.

## 5. Execution Checklist

1. [ ] **Move Files**: Copy `.py` files to `core/`.
2. [ ] **Move Secrets**: Copy `.json` files to `secrets/`.
3. [ ] **Update Imports**: Fix `import` statements in `core/workflow_engine.py` to point to sibling files.
4. [ ] **Update Paths**: Fix `CREDENTIALS_FILE` paths in `core/google_integration.py` to point to `secrets/`.
5. [ ] **Update App**: Add the route to `app.py`.
6. [ ] **Update UI**: Copy HTML and fix API URL.

---
**Ready to start?** I can perform these file moves and code updates for you now.
