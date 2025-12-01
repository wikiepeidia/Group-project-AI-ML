#!/usr/bin/env python3
"""
Add demo user account
"""

import sqlite3
import hashlib

def add_demo_user():
    db_path = 'fun_work_hub.db'
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Check if user already exists
    c.execute("SELECT email FROM users WHERE email = ?", ('user@demo.com',))
    if c.fetchone():
        print("❌ Tài khoản user@demo.com đã tồn tại!")
        conn.close()
        return
    
    # Add demo user
    password = hashlib.sha256('1234'.encode()).hexdigest()
    c.execute('''INSERT INTO users (email, password, name, role) 
                VALUES (?, ?, ?, ?)''',
             ('user@demo.com', password, 'Demo User', 'user'))
    
    conn.commit()
    conn.close()
    
    print("✓ Đã thêm tài khoản user:")
    print("  Email: user@demo.com")
    print("  Password: 1234")
    print("  Role: user")

if __name__ == '__main__':
    add_demo_user()
