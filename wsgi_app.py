#!/usr/local/bin/python3.7
"""
WSGI アプリケーション
ロリポップでの実行用（index.cgi から呼び出される）
"""
from flask import Flask
import os

# CGI環境での SCRIPT_NAME をリセット（url_for の重複パス問題を解決）
if 'SCRIPT_NAME' in os.environ:
    os.environ['SCRIPT_NAME'] = ''

# Flask アプリケーション
app = Flask(__name__, 
            template_folder=os.path.join(os.path.dirname(__file__), 'app', 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), 'app', 'static'))

# CGI環境でのパス問題を解決するため APPLICATION_ROOT を設定
app.config['APPLICATION_ROOT'] = '/'

# 秘密鍵設定
app.secret_key = os.getenv('SECRET_KEY', 'dev-key-change-in-production')

# 各アプリのBlueprintをインポート・登録
try:
    from app.portal import portal_bp
    from app.kuku import kuku_bp
    from app.calc import calc_bp
    
    # ポータル画面（ルート）
    app.register_blueprint(portal_bp, url_prefix='/')
    
    # 各学習アプリ
    app.register_blueprint(kuku_bp, url_prefix='/kuku')
    app.register_blueprint(calc_bp, url_prefix='/calc')
    
    # グローバルエラーハンドラ
    from flask import jsonify
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not Found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Internal server error: {error}')
        return jsonify({'error': 'Internal Server Error'}), 500
    
except Exception as e:
    # エラーログを出力
    import traceback
    error_msg = f"Error loading Flask app: {str(e)}\n{traceback.format_exc()}"
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(current_dir, 'error.log'), 'a') as f:
        f.write(error_msg + '\n')
    raise

if __name__ == '__main__':
    # 開発環境での起動（手動実行時）
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=True,
        threaded=True
    )
