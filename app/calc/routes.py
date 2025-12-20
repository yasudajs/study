"""
四則演算練習アプリケーション - ルート定義
"""
from flask import request, jsonify, render_template, current_app
from . import calc_bp
from .models import QuizSession

@calc_bp.route('/', methods=['GET'])
def index():
    """四則演算アプリのメイン画面を表示"""
    return render_template('calc/index.html')

@calc_bp.route('/api/session', methods=['POST'])
def create_session():
    """
    セッション作成エンドポイント

    リクエスト:
    {
        "operator": "add",  # add, sub, mul, div
        "digits": "1",      # 1, 2, 3, 4, custom
        "custom_min": 1,    # optional
        "custom_max": 10    # optional
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400

    # バリデーション
    operator = data.get('operator')
    digits = data.get('digits')

    if operator not in ['add', 'sub', 'mul', 'div']:
        return jsonify({'error': 'Invalid operator'}), 400

    settings = {
        'operator': operator,
        'digits': digits,
        'custom_min': data.get('custom_min'),
        'custom_max': data.get('custom_max')
    }

    # セッション作成
    session = QuizSession(settings=settings)
    session.save()

    return jsonify({
        'session_id': session.id,
        'message': 'Session created'
    }), 200

@calc_bp.route('/api/result', methods=['POST'])
def save_result():
    """結果保存エンドポイント"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400

    session_id = data.get('session_id')
    correct_count = data.get('correct_count')
    total_count = data.get('total_count')
    correct_rate = data.get('correct_rate')

    if not session_id or correct_count is None or total_count is None:
        return jsonify({'error': 'Missing required fields'}), 400

    session = QuizSession.get_by_id(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    session.update_result(correct_count, total_count, correct_rate)
    session.mark_completed()

    return jsonify({
        'success': True,
        'message': 'Result saved successfully'
    }), 200
