"""
Flask アプリケーションファクトリー
"""
from flask import Flask
from config import get_config
from app.common.utils import init_logger
from flask import send_from_directory

def create_app(config_name='development'):
    """
    Flaskアプリケーションファクトリ
    
    Args:
        config_name: 設定名 ('development', 'production', 'testing')
    """
    import os
    base_dir = os.path.abspath(os.path.dirname(__file__))
    app = Flask(__name__,
                template_folder=os.path.join(base_dir, 'templates'),
                static_folder=os.path.join(base_dir, 'static'))
    
    # 設定の読み込み
    config = get_config(config_name)
    app.config.from_object(config)
    
    # ロギング初期化
    init_logger(app)
    
    # Blueprint登録
    from app.portal import portal_bp
    from app.kuku import kuku_bp
    from app.shisoku import shisoku_bp
    from app.tankanji import tankanji_bp
    
    # ポータル画面（ルート）
    app.register_blueprint(portal_bp, url_prefix='/')
    
    # 各学習アプリ
    app.register_blueprint(kuku_bp)
    app.register_blueprint(shisoku_bp)
    app.register_blueprint(tankanji_bp)
    
    # グローバルエラーハンドラ
    register_error_handlers(app)
    
    # favicon 配信（ブラウザの自動リクエスト対応）
    app.add_url_rule('/favicon.ico', 'favicon', lambda: send_from_directory(
        os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static', 'images', 'app_icons'),
        'shisoku.svg',
        mimetype='image/svg+xml'
    ))

    app.logger.info(f'Flask application created in {config_name} mode')
    
    return app

def register_error_handlers(app):
    """グローバルエラーハンドラの登録"""
    from flask import jsonify
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not Found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Internal server error: {error}')
        return jsonify({'error': 'Internal Server Error'}), 500
