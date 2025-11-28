"""
九九練習アプリケーション - データモデル
"""
import sqlite3
from datetime import datetime
import uuid
import json
from flask import current_app
import os

class QuizSession:
    """
    クイズセッションモデル
    
    クライアント側で全ての問題生成・採点が完了した後、
    最終結果のみをサーバーに保存します。
    """
    
    def __init__(self, levels, mode, app_type='kuku'):
        self.id = str(uuid.uuid4())
        self.app_type = app_type
        self.levels = levels
        self.mode = mode
        self.correct_count = 0
        self.total_count = 0
        self.correct_rate = 0
        self.status = 'active'  # 'active' or 'completed'
        self.created_at = datetime.now()
    
    def save(self):
        """
        セッションを作成（初期化のみ）
        クライアント側で問題生成・採点を行うため、
        詳細情報はまだ保存しません。
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                INSERT INTO quiz_sessions 
                (id, app_type, levels, mode, status)
                VALUES (?, ?, ?, ?, ?)
                """,
                (self.id, self.app_type, json.dumps(self.levels), 
                 self.mode, self.status)
            )
            
            conn.commit()
            current_app.logger.info(f'Session created: {self.id}')
        
        finally:
            cursor.close()
            conn.close()
    
    def update_result(self, correct_count, total_count, correct_rate):
        """
        クライアント側で計算した結果を更新
        
        Args:
            correct_count: 正答数
            total_count: 全問数
            correct_rate: 正答率（パーセント）
        """
        self.correct_count = correct_count
        self.total_count = total_count
        self.correct_rate = correct_rate
    
    def mark_completed(self):
        """セッションを完了状態に変更"""
        self.status = 'completed'
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                UPDATE quiz_sessions 
                SET status = ?, correct_count = ?, total_count = ?
                WHERE id = ?
                """,
                (self.status, self.correct_count, self.total_count, self.id)
            )
            
            conn.commit()
            current_app.logger.info(f'Session completed: {self.id}')
        
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def get_by_id(session_id):
        """セッションを取得"""
        conn = QuizSession.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "SELECT * FROM quiz_sessions WHERE id = ?",
                (session_id,)
            )
            
            row = cursor.fetchone()
            
            if not row:
                return None
            
            session = QuizSession(
                levels=json.loads(row['levels']),
                mode=row['mode']
            )
            session.id = row['id']
            session.correct_count = row['correct_count']
            session.total_count = row['total_count']
            session.status = row['status']
            
            return session
        
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def get_db_connection():
        """SQLite接続"""
        db_path = current_app.config.get('DATABASE', 'data/study.db')
        os.makedirs(os.path.dirname(db_path) or '.', exist_ok=True)
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
