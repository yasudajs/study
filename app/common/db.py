"""
データベース初期化・管理モジュール
"""
import sqlite3
import os
from flask import current_app

def init_db(app):
    """データベースを初期化（テーブル作成）"""
    db_path = app.config.get('DATABASE', 'data/study.db')
    
    # ディレクトリ作成
    os.makedirs(os.path.dirname(db_path) or '.', exist_ok=True)
    
    # SQLite接続
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # quiz_sessionsテーブル作成
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quiz_sessions (
                id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                app_type TEXT NOT NULL,
                levels TEXT NOT NULL,
                mode TEXT NOT NULL,
                correct_count INTEGER DEFAULT 0,
                total_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active'
            )
        """)
        
        conn.commit()
        app.logger.info('Database initialized successfully')
    
    except Exception as e:
        app.logger.error(f'Database initialization error: {e}')
        raise
    
    finally:
        cursor.close()
        conn.close()

def get_db_connection():
    """SQLite接続を取得"""
    db_path = current_app.config.get('DATABASE', 'data/study.db')
    
    # ディレクトリがなければ作成
    os.makedirs(os.path.dirname(db_path) or '.', exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn
