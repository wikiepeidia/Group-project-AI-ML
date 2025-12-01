#!/usr/bin/env python3
"""
Add manager account
"""

import sqlite3
import hashlib

def add_manager():
    db_path = 'fun_work_hub.db'
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Check if manager already exists
    c.execute("SELECT email FROM users WHERE email = ?", ('manager@fun.com',))
    if c.fetchone():
        print("❌ Tài khoản manager@fun.com đã tồn tại!")
        conn.close()
        return
    
    # Add manager account
    password = hashlib.sha256('manager123'.encode()).hexdigest()
    c.execute('''INSERT INTO users (email, password, name, first_name, last_name, role) 
                VALUES (?, ?, ?, ?, ?, ?)''',
             ('manager@fun.com', password, 'Manager User', 'Manager', 'User', 'manager'))
    
    conn.commit()
    conn.close()
    
    print("✓ Đã thêm tài khoản manager:")
    print("  Email: manager@fun.com")
    print("  Password: manager123")
    print("  Role: manager")

if __name__ == '__main__':
    add_manager()
