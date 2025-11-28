"""
ポータル画面 - ルート定義
"""
from flask import render_template
from . import portal_bp
from .logic import get_available_apps

@portal_bp.route('/', methods=['GET'])
def index():
    """ポータル画面（アプリ一覧）を表示"""
    apps = get_available_apps()
    return render_template('portal/index.html', apps=apps)

@portal_bp.route('/api-test', methods=['GET'])
def api_test():
    """API テストページを表示（開発用）"""
    return render_template('api_test.html')

@portal_bp.errorhandler(404)
def not_found(error):
    """404エラーハンドラ"""
    from flask import jsonify
    return jsonify({'error': 'Not Found'}), 404

@portal_bp.errorhandler(500)
def internal_error(error):
    """500エラーハンドラ"""
    from flask import jsonify, current_app
    current_app.logger.error(f'Internal server error: {error}')
    return jsonify({'error': 'Internal Server Error'}), 500
