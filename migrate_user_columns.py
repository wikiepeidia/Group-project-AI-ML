#!/usr/bin/env python3
"""
Add first_name and last_name columns to users table
"""

import sqlite3

def migrate_user_columns():
    db_path = 'fun_work_hub.db'
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Check current columns
    c.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in c.fetchall()]
    print(f"Current columns: {columns}")
    
    # Add first_name if not exists
    if 'first_name' not in columns:
        print("Adding first_name column...")
        c.execute("ALTER TABLE users ADD COLUMN first_name TEXT")
    
    # Add last_name if not exists
    if 'last_name' not in columns:
        print("Adding last_name column...")
        c.execute("ALTER TABLE users ADD COLUMN last_name TEXT")
    
    # Migrate existing 'name' data to first_name
    print("Migrating existing names...")
    c.execute("UPDATE users SET first_name = name WHERE first_name IS NULL")
    
    conn.commit()
    conn.close()
    
    print("✓ Migration completed!")
    print("✓ Added columns: first_name, last_name")

if __name__ == '__main__':
    migrate_user_columns()
