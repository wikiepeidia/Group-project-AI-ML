import json
import psycopg2

print("🔧 Fixing Neon Database Schema...")

# 1. Load Config
try:
    with open('secrets/database.json') as f:
        config = json.load(f)
        db_url = config['POSTGRES_URL']
        print(f"✅ Loaded database URL: {db_url[:50]}...")
except Exception as e:
    print(f"❌ Could not find secrets/database.json: {e}")
    exit()

# 2. Connect and Create Table
try:
    print("📡 Connecting to Neon database...")
    conn = psycopg2.connect(db_url)
    c = conn.cursor()
    print("✅ Connected successfully!")
    
    print("🔨 Creating 'ai_chat_history' with Postgres syntax...")
    
    # POSTGRES SYNTAX (SERIAL instead of AUTOINCREMENT)
    c.execute("""
        CREATE TABLE IF NOT EXISTS ai_chat_history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            role TEXT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    print("✅ ai_chat_history table created")
    
    # Also ensure feedback_logs exists while we are at it
    c.execute("""
        CREATE TABLE IF NOT EXISTS feedback_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            prompt TEXT,
            ai_response TEXT,
            user_correction TEXT,
            feedback_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    print("✅ feedback_logs table created")
    
    conn.commit()
    conn.close()
    print("✅ Success! All tables created and committed.")
    
except Exception as e:
    print(f"❌ DB Error: {e}")
    import traceback
    traceback.print_exc()