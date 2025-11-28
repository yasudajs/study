"""
WSGI エントリーポイント
開発環境および本番環境での起動用
"""
import os
from app import create_app

# 環境変数から設定名を取得（デフォルト: development）
config_name = os.getenv('FLASK_ENV', 'development')

# アプリケーション作成
app = create_app(config_name)

if __name__ == '__main__':
    # 開発環境での起動
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=app.config['DEBUG']
    )
