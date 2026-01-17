#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
データベース確認スクリプト
study.db の内容を調査
"""

import sqlite3
import os

def check_database():
    db_path = 'data/study.db'
    
    if not os.path.exists(db_path):
        print(f"❌ データベースファイルが見つかりません: {db_path}")
        return
    
    print("=" * 80)
    print(f"データベース: {db_path}")
    print("=" * 80)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # テーブル一覧を取得
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    if not tables:
        print("\n⚠️ テーブルが存在しません")
        conn.close()
        return
    
    print(f"\nテーブル数: {len(tables)}")
    print("-" * 80)
    
    for table in tables:
        table_name = table[0]
        print(f"\n📋 テーブル: {table_name}")
        
        # テーブル構造を取得
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        print("  カラム:")
        for col in columns:
            col_id, col_name, col_type, not_null, default_val, is_pk = col
            pk_mark = " [PK]" if is_pk else ""
            null_mark = " NOT NULL" if not_null else ""
            print(f"    - {col_name} ({col_type}){pk_mark}{null_mark}")
        
        # レコード数を取得
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"  レコード数: {count}行")
        
        # サンプルデータを表示（最大5件）
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
            rows = cursor.fetchall()
            print(f"  サンプルデータ（最大5件）:")
            for i, row in enumerate(rows, 1):
                print(f"    {i}. {row}")
    
    conn.close()
    
    print("\n" + "=" * 80)
    print("確認完了")
    print("=" * 80)

if __name__ == "__main__":
    check_database()
