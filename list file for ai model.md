# Workspace Builder Files Structure

## Backend (Python)

- `app.py`: Main Flask application file containing API routes for workflow execution (`/api/workflow/execute`) and scenario management (`/api/scenarios`).
- `core/workflow_engine.py`: Core logic for executing the workflow graph, topological sorting of nodes, and handling node execution logic.
- `core/database.py`: Database interaction layer, likely handling the storage of scenarios and workflow history (though some might be in app.py directly).
- `core/google_integration.py`: Handles Google API interactions (Sheets, Docs, Gmail) used by workflow nodes.
- `core/make_integration.py`: Handles webhook integrations (Make.com, etc.) used by workflow nodes.

## Frontend (HTML/JS)

- `ui/templates/workspace_builder.html`: The main HTML template for the drag-and-drop workspace builder interface.
- `static/js/workspace_builder.js`: The complex JavaScript logic processing the drag-and-drop, connection logic, node configuration, and communication with the backend.
