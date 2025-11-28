"""
九九練習アプリケーション - ルート定義
"""
from flask import request, jsonify, render_template, current_app
from . import kuku_bp
from .models import QuizSession

@kuku_bp.route('/', methods=['GET'])
def index():
    """九九練習アプリのメイン画面を表示"""
    return render_template('kuku/index.html')

@kuku_bp.route('/api/session', methods=['POST'])
def create_session():
    """
    セッション作成エンドポイント
    
    クライアント側で全てのクイズを生成するためのセッションを作成します。
    
    リクエスト:
    {
        "levels": [2, 3, 5],
        "mode": "sequential" or "random"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    # バリデーション
    levels = data.get('levels', [])
    mode = data.get('mode', 'sequential')
    
    if not levels or not all(isinstance(l, int) and 1 <= l <= 9 for l in levels):
        return jsonify({'error': 'Invalid levels'}), 400
    
    if mode not in ['sequential', 'random']:
        return jsonify({'error': 'Invalid mode'}), 400
    
    # セッション作成（問題生成はクライアント側で実施）
    session = QuizSession(levels=levels, mode=mode)
    session.save()
    
    current_app.logger.info(f'Session created: {session.id}')
    
    return jsonify({
        'session_id': session.id,
        'message': 'Session created'
    }), 200

@kuku_bp.route('/api/result', methods=['POST'])
def save_result():
    """
    結果保存エンドポイント
    
    クライアント側で計算した最終結果をサーバーに保存します。
    
    リクエスト:
    {
        "session_id": "...",
        "correct_count": 8,
        "total_count": 9,
        "correct_rate": 88
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    session_id = data.get('session_id')
    correct_count = data.get('correct_count')
    total_count = data.get('total_count')
    correct_rate = data.get('correct_rate')
    
    # バリデーション
    if not session_id or correct_count is None or total_count is None:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not isinstance(correct_count, int) or not isinstance(total_count, int):
        return jsonify({'error': 'Invalid data types'}), 400
    
    if correct_count > total_count or correct_count < 0 or total_count <= 0:
        return jsonify({'error': 'Invalid counts'}), 400
    
    # セッション取得と結果更新
    session = QuizSession.get_by_id(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # 結果をセッションに保存
    session.update_result(correct_count, total_count, correct_rate)
    session.mark_completed()
    
    current_app.logger.info(
        f'Result saved: {session_id} - {correct_count}/{total_count}'
    )
    
    return jsonify({
        'success': True,
        'message': 'Result saved successfully',
        'session_id': session_id
    }), 200

@kuku_bp.errorhandler(404)
def not_found(error):
    """404エラーハンドラ"""
    return jsonify({'error': 'Not Found'}), 404

@kuku_bp.errorhandler(500)
def internal_error(error):
    """500エラーハンドラ"""
    current_app.logger.error(f'Internal server error: {error}')
    return jsonify({'error': 'Internal Server Error'}), 500
