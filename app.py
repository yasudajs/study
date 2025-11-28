#!/usr/local/bin/python3.7
"""
WSGI アプリケーション
ロリポップでの実行用（index.cgi から呼び出される）
"""
import os
import sys

# 仮想環境のパスを追加
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app

# 環境に応じた設定（開発環境がデフォルト）
config_name = os.getenv('FLASK_ENV', 'development')
app = create_app(config_name)

if __name__ == '__main__':
    # 開発環境での起動（手動実行時）
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=app.config['DEBUG']
    )
