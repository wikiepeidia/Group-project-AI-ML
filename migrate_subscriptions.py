#!/usr/bin/env python3
"""
Manager Subscription Migration
Adds subscription tracking for managers with expiry dates
"""

import sqlite3
import os
from datetime import datetime, timedelta

def migrate_subscriptions():
    db_path = 'workspace_management.db'
    
    if not os.path.exists(db_path):
        print("❌ Database doesn't exist. Please create it first.")
        return
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    try:
        # Create manager_subscriptions table
        print("Creating manager_subscriptions table...")
        c.execute('''CREATE TABLE IF NOT EXISTS manager_subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            subscription_type TEXT NOT NULL,
            amount REAL NOT NULL,
            start_date TIMESTAMP NOT NULL,
            end_date TIMESTAMP NOT NULL,
            status TEXT DEFAULT 'active',
            payment_method TEXT,
            transaction_id TEXT,
            auto_renew INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )''')
        print("✓ manager_subscriptions table created")
        
        # Create subscription_history table for tracking payments
        print("Creating subscription_history table...")
        c.execute('''CREATE TABLE IF NOT EXISTS subscription_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            subscription_type TEXT NOT NULL,
            amount REAL NOT NULL,
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            payment_method TEXT,
            transaction_id TEXT,
            status TEXT DEFAULT 'completed',
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )''')
        print("✓ subscription_history table created")
        
        # Add subscription_expires_at column to users table if not exists
        c.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in c.fetchall()]
        
        if 'subscription_expires_at' not in columns:
            print("Adding 'subscription_expires_at' column to users table...")
            c.execute('ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP')
            print("✓ subscription_expires_at column added")
        else:
            print("✓ subscription_expires_at column already exists")
        
        # Set default expiry for existing managers (30 days from now)
        print("Setting default expiry for existing managers...")
        default_expiry = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')
        c.execute('''UPDATE users 
                    SET subscription_expires_at = ? 
                    WHERE role = 'manager' AND subscription_expires_at IS NULL''', 
                 (default_expiry,))
        
        # Create subscriptions for existing managers
        c.execute("SELECT id, name, email FROM users WHERE role = 'manager'")
        existing_managers = c.fetchall()
        
        for manager_id, name, email in existing_managers:
            # Check if subscription already exists
            c.execute("SELECT id FROM manager_subscriptions WHERE user_id = ?", (manager_id,))
            if not c.fetchone():
                start_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                end_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')
                
                c.execute('''INSERT INTO manager_subscriptions 
                            (user_id, subscription_type, amount, start_date, end_date, status)
                            VALUES (?, ?, ?, ?, ?, ?)''',
                         (manager_id, 'trial', 0, start_date, end_date, 'active'))
                
                print(f"✓ Created trial subscription for {name} ({email})")
        
        conn.commit()
        print("\n✅ Manager subscription migration completed successfully!")
        print("\n📋 Subscription Plans:")
        print("   - Trial: 0đ (30 days) - Default for existing managers")
        print("   - Monthly: 500,000đ (30 days)")
        print("   - Quarterly: 1,200,000đ (90 days)")
        print("   - Yearly: 4,000,000đ (365 days)")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_subscriptions()
