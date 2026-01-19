import json
import re
from datetime import datetime

class AgentMiddleware:
    def __init__(self, db_manager):
        self.db = db_manager

    def get_system_context(self):
        """
        Generates the System Prompt containing DB Schema and Workflow Tools.
        """
        schema = self._get_db_schema_summary()
        
        # Define the exact JSON structure your workflow_engine.py expects
        tools_def = """
        [WORKFLOW ENGINE CAPABILITIES]
        You can build automations using these Node Types (and ONLY these):
        1. 'google_sheet_read': { "sheetId": "...", "range": "A1:Z" }
        2. 'google_sheet_write': { "sheetId": "...", "range": "A1", "data": "{{parent.output}}", "writeMode": "append" }
        3. 'gmail_send': { "to": "...", "subject": "...", "body": "..." }
        4. 'slack_notify': { "url": "webhook_url", "message": "..." }
        5. 'discord_notify': { "url": "webhook_url", "message": "..." }
        6. 'filter': { "keyword": "..." }
        7. 'invoice_ocr': { "fileUrl": "..." }
        
        [ACTION PROTOCOL]
        1. If the user asks to create an automation, output a JSON object with "action": "create_workflow".
           Structure:
           {
             "action": "create_workflow",
             "name": "Workflow Name",
             "payload": {
               "nodes": [
                 { "id": "1", "type": "google_sheet_read", "config": { ... }, "position": { "x": 100, "y": 100 } },
                 { "id": "2", "type": "gmail_send", "config": { ... }, "position": { "x": 400, "y": 100 } }
               ],
               "edges": [
                 { "id": "e1", "from": "1", "to": "2" }
               ]
             }
           }

        2. If the user asks for data (revenue, stock, etc.) or to update data, output "action": "query_db".
           Structure:
           {
             "action": "query_db",
             "query": "SELECT * FROM products WHERE stock_quantity < 10"
           }
        """
        
        return f"""
        [DATABASE CONTEXT]
        {schema}
        
        {tools_def}
        """

    def _get_db_schema_summary(self):
        """Generates a summary of tables and columns for the AI."""
        try:
            conn = self.db.get_connection()
            c = conn.cursor()
            
            # Compatible with both SQLite and Postgres
            # Check if using Postgres via Config or attribute
            try:
                # Try Postgres specific query first
                c.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                tables = [r[0] for r in c.fetchall()]
            except:
                # Fallback to SQLite
                c.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = [r[0] for r in c.fetchall()]
            
            summary = []
            for table in tables:
                if table in ['sqlite_sequence', 'schema_migrations', 'alembic_version']: continue
                
                # Get columns using db_manager's helper
                cols = self.db.get_table_columns(table, cursor=c)
                summary.append(f"Table '{table}': {', '.join(cols)}")
            
            return "\n".join(summary)
        except Exception as e:
            return f"Error reading schema: {e}"
        finally:
            if 'conn' in locals(): conn.close()

    def process_ai_response(self, ai_text, user_id):
        """
        Scans AI response for Action Blocks. If found, executes them.
        Returns: (Final Text to User, Action Metadata)
        """
        # Regex to find JSON block: ```json ... ``` or just { "action": ... }
        json_match = re.search(r'```json\n(.*?)\n```', ai_text, re.DOTALL)
        if not json_match:
            json_match = re.search(r'(\{.*"action":\s*".*".*\})', ai_text, re.DOTALL)
            
        if json_match:
            try:
                data = json.loads(json_match.group(1))
                action = data.get('action')
                
                if action == 'create_workflow':
                    return self._handle_create_workflow(data, user_id)
                elif action == 'query_db':
                    return self._handle_query_db(data, user_id)
            except Exception as e:
                print(f"[Middleware] JSON Parse Error: {e}")
        
        # If no action, return original text
        return ai_text, None

    def _handle_create_workflow(self, data, user_id):
        """Saves the workflow to the database."""
        name = data.get('name', 'AI Generated Flow')
        payload = data.get('payload', {})
        
        # Validate structure
        if 'nodes' not in payload:
            return "Error: AI generated invalid workflow structure (missing 'nodes').", None

        # --- FIX: UI COMPATIBILITY MAPPING ---
        # The AI generates 'edges' (from/to), but Frontend might expect 'connections' (source/target)
        if 'edges' in payload:
            payload['connections'] = []
            for edge in payload['edges']:
                payload['connections'].append({
                    "source": f"node-{edge['from']}" if not str(edge['from']).startswith('node-') else edge['from'],
                    "target": f"node-{edge['to']}" if not str(edge['to']).startswith('node-') else edge['to']
                })
                
        # Ensure nodes have correct UI IDs (node-1, node-2) if the AI used simple numbers
        for node in payload['nodes']:
            if not str(node['id']).startswith('node-'):
                node['id'] = f"node-{node['id']}"
        # -------------------------------------

        conn = self.db.get_connection()
        c = conn.cursor()
        try:
            workflow_json = json.dumps(payload)
            
            # Use Postgres compatible query if needed, or standard SQL
            if hasattr(self.db, 'use_postgres') and self.db.use_postgres:
                c.execute('INSERT INTO workflows (user_id, name, data, created_at, updated_at) VALUES (%s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
                        (user_id, name, workflow_json))
                workflow_id = c.fetchone()[0]
            else:
                c.execute('INSERT INTO workflows (user_id, name, data, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                        (user_id, name, workflow_json))
                workflow_id = c.lastrowid
                
            conn.commit()
            
            success_msg = f"✅ **Quy trình đã được tạo!**\n\nTên: {name}\nTôi đã lưu nó vào Workspace của bạn.\n\n[Mở trong Workflow Builder](/workspace/builder?load={workflow_id})"
            return success_msg, {"action": "workflow_created", "id": workflow_id}
        except Exception as e:
            return f"Database Error saving workflow: {str(e)}", None
        finally:
            conn.close()

    def _handle_query_db(self, data, user_id):
        """Executes SQL Query securely."""
        query = data.get('query', '')
        
        # Safety Filter (Block schema destruction)
        forbidden = ['DROP', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE']
        if any(w in query.upper() for w in forbidden):
            return "🚫 **Safety Alert:** I cannot execute destructive schema changes (DROP/ALTER).", None

        conn = self.db.get_connection()
        c = conn.cursor()
        try:
            c.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                rows = c.fetchall()
                # Limit results to avoid context overflow
                if len(rows) > 10:
                    result_str = f"Found {len(rows)} rows. First 10: {str(rows[:10])}"
                else:
                    result_str = str(rows)
                
                return f"🔍 **Kết quả dữ liệu:**\n`{result_str}`", {"type": "query_result", "data": rows}
            else:
                # INSERT/UPDATE/DELETE
                conn.commit()
                return f"✅ **Cập nhật dữ liệu thành công.**\nLệnh thực thi: `{query}`", {"type": "db_update"}
                
        except Exception as e:
            return f"❌ **Lỗi SQL:** {e}", None
        finally:
            conn.close()