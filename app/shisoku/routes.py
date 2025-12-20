"""
四則演算練習アプリケーション - ルート定義
"""
from flask import render_template, jsonify, current_app
from . import shisoku_bp


@shisoku_bp.route('/', methods=['GET'])
def index():
    """四則演算アプリのメイン画面を表示"""
    return render_template('shisoku/index.html')


@shisoku_bp.errorhandler(404)
def not_found(error):
    """404エラーハンドラ"""
    return jsonify({'error': 'Not Found'}), 404


@shisoku_bp.errorhandler(500)
def internal_error(error):
    """500エラーハンドラ"""
    current_app.logger.error(f'Internal server error: {error}')
    return jsonify({'error': 'Internal Server Error'}), 500
