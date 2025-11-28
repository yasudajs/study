"""
共通ユーティリティ関数
"""
import logging
import os
from logging.handlers import RotatingFileHandler

def init_logger(app):
    """ログ初期化"""
    if not app.debug:
        # logsディレクトリ作成
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        # ロギングハンドラ設定
        file_handler = RotatingFileHandler(
            'logs/app.log',
            maxBytes=10240000,  # 10MB
            backupCount=10
        )
        
        # フォーマッタ設定
        formatter = logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(logging.INFO)
        
        # ハンドラをアプリケーションに追加
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Application startup')

def get_db_connection():
    """SQLite接続を取得"""
    import sqlite3
    from flask import current_app
    
    db_path = current_app.config.get('DATABASE', 'data/study.db')
    
    # ディレクトリがなければ作成
    os.makedirs(os.path.dirname(db_path) or '.', exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn
