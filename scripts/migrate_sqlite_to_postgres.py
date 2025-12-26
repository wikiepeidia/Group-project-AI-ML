import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

# Source (local sqlite) and target (postgres) URLs
SRC = os.getenv("SRC_DB_URL", "sqlite:///./group_project_ai_ml.db")
DST = os.getenv("DATABASE_URL")  # e.g. postgresql+psycopg://user:pass@host:5432/dbname

if not DST:
    print("ERROR: Set DATABASE_URL (target) before running this script")
    sys.exit(2)

# Import your models & Base
from app.models import (
    User, Workspace, Item, Scenario, Channel, UserPermission, SystemSetting, ActivityLog,
    Workflow, Customer, Product, ImportTransaction, ImportDetail, ExportTransaction, ExportDetail,
    SEAutomation, ScheduledReport, ManagerSubscription, SubscriptionHistory, Wallet, WalletTransaction
)
from app.db import Base as TargetBase

src_engine = create_engine(SRC, future=True)
dst_engine = create_engine(DST, future=True)

def ensure_dst_connectable(engine):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except OperationalError as e:
        print("ERROR: cannot connect to destination database:")
        msg = str(e)
        print('\n'.join(msg.splitlines()[:8]))
        print("\nCommon fixes:")
        print(" - Ensure Postgres is running (docker-compose up -d or your managed DB).")
        print(" - Verify DATABASE_URL is correct and reachable from this host.")
        print(" - If running in Docker, map port 5432 and ensure firewall allows connections.")
        print(" - Try: psql <connection-string> or `docker logs <container>` to inspect Postgres.")
        return False


# Check destination connectivity before attempting schema creation
if not ensure_dst_connectable(dst_engine):
    sys.exit(3)

# Create schema on destination if not exists
try:
    TargetBase.metadata.create_all(bind=dst_engine)
except OperationalError as e:
    print("Failed to create schema on destination database:")
    print(e)
    sys.exit(4)

def migrate_table(ssrc, sdst, Model, table_name, columns):
    print(f"Migrating {table_name}...")
    # Construct SELECT query
    cols_str = ", ".join(columns)
    query = text(f"SELECT {cols_str} FROM {table_name}")
    
    try:
        rows = ssrc.execute(query).all()
    except Exception as e:
        print(f"Skipping {table_name} (source table might not exist): {e}")
        return

    for row in rows:
        data = {}
        for i, col in enumerate(columns):
            val = row[i]
            # Handle potential naming mismatches if any (e.g. password vs hashed_password)
            # In our models we used 'password' to match sqlite schema, so it should be fine.
            data[col] = val
        
        # Create instance
        obj = Model(**data)
        sdst.merge(obj)
    sdst.commit()

with Session(src_engine) as ssrc, Session(dst_engine) as sdst:
    # 1. Users
    migrate_table(ssrc, sdst, User, "users", 
        ["id", "email", "password", "name", "first_name", "last_name", "avatar", "theme", "role", "google_token", "google_email", "manager_id", "subscription_expires_at", "created_at"])

    # 2. Workspaces
    migrate_table(ssrc, sdst, Workspace, "workspaces",
        ["id", "user_id", "name", "type", "description", "settings", "created_at"])

    # 3. Items
    migrate_table(ssrc, sdst, Item, "items",
        ["id", "workspace_id", "title", "description", "type", "status", "priority", "assignee_id", "parent_id", "metadata", "created_at", "updated_at"])

    # 4. Scenarios
    migrate_table(ssrc, sdst, Scenario, "scenarios",
        ["id", "workspace_id", "name", "description", "steps", "conditions", "status", "created_at"])

    # 5. Channels
    migrate_table(ssrc, sdst, Channel, "channels",
        ["id", "from_workspace_id", "to_workspace_id", "channel_type", "config", "active", "created_at"])

    # 6. User Permissions
    migrate_table(ssrc, sdst, UserPermission, "user_permissions",
        ["id", "user_id", "permission_type", "granted_by", "granted_at", "revoked"])

    # 7. System Settings
    migrate_table(ssrc, sdst, SystemSetting, "system_settings",
        ["key", "value", "group_name", "updated_at"])

    # 8. Activity Logs
    migrate_table(ssrc, sdst, ActivityLog, "activity_logs",
        ["id", "user_id", "action", "details", "ip_address", "created_at"])

    # 9. Workflows
    migrate_table(ssrc, sdst, Workflow, "workflows",
        ["id", "user_id", "name", "data", "created_at", "updated_at"])

    # 10. Customers
    migrate_table(ssrc, sdst, Customer, "customers",
        ["id", "code", "name", "phone", "email", "address", "notes", "created_by", "created_at", "updated_at"])

    # 11. Products
    migrate_table(ssrc, sdst, Product, "products",
        ["id", "code", "name", "category", "unit", "price", "stock_quantity", "description", "created_by", "created_at", "updated_at"])

    # 12. Import Transactions
    migrate_table(ssrc, sdst, ImportTransaction, "import_transactions",
        ["id", "code", "supplier_name", "total_amount", "notes", "status", "created_by", "created_at"])

    # 13. Import Details
    migrate_table(ssrc, sdst, ImportDetail, "import_details",
        ["id", "import_id", "product_id", "quantity", "unit_price", "total_price"])

    # 14. Export Transactions
    migrate_table(ssrc, sdst, ExportTransaction, "export_transactions",
        ["id", "code", "customer_id", "total_amount", "notes", "status", "created_by", "created_at"])

    # 15. Export Details
    migrate_table(ssrc, sdst, ExportDetail, "export_details",
        ["id", "export_id", "product_id", "quantity", "unit_price", "total_price"])

    # 16. SE Automations
    migrate_table(ssrc, sdst, SEAutomation, "se_automations",
        ["id", "name", "type", "config", "enabled", "last_run", "created_by", "created_at"])

    # 17. Scheduled Reports
    migrate_table(ssrc, sdst, ScheduledReport, "scheduled_reports",
        ["id", "name", "report_type", "frequency", "channel", "recipients", "status", "last_sent_at", "created_by", "created_at"])

    # 18. Manager Subscriptions
    migrate_table(ssrc, sdst, ManagerSubscription, "manager_subscriptions",
        ["id", "user_id", "subscription_type", "amount", "start_date", "end_date", "status", "payment_method", "transaction_id", "auto_renew", "created_at", "updated_at"])

    # 19. Subscription History
    migrate_table(ssrc, sdst, SubscriptionHistory, "subscription_history",
        ["id", "user_id", "subscription_type", "amount", "payment_date", "payment_method", "transaction_id", "status", "notes"])

    # 20. Wallets
    migrate_table(ssrc, sdst, Wallet, "wallets",
        ["user_id", "balance", "currency", "updated_at"])

    # 21. Wallet Transactions
    migrate_table(ssrc, sdst, WalletTransaction, "wallet_transactions",
        ["id", "user_id", "amount", "currency", "type", "status", "method", "reference", "notes", "metadata", "created_at", "updated_at"])

print("Data migration finished.")
