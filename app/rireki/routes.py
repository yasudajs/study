from flask import render_template, jsonify, request, current_app
from app.rireki import rireki_bp
from app.rireki.logic import HistoryLogic

history_logic = HistoryLogic()

@rireki_bp.route('/', methods=['GET'])
def calendar():
    """
    カレンダー型履歴表示ページ
    """
    return render_template('rireki/calendar.html')


@rireki_bp.route('/api/save', methods=['POST'])
def save_record():
    """
    学習結果をサーバーに保存（将来のDB連携用）
    Request: {"appId": "kuku", "record": {...}}
    """
    try:
        data = request.get_json()
        app_id = data.get('appId')
        record = data.get('record')

        if not app_id or not record:
            return jsonify({'status': 'error', 'message': '不正なリクエスト'}), 400

        # 将来的にDBに保存する処理
        # result = history_logic.save_to_db(app_id, record)

        return jsonify({
            'status': 'success',
            'message': '結果を保存しました'
        }), 200

    except Exception as e:
        current_app.logger.error(f'Error saving record: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500


@rireki_bp.route('/api/stats/<app_id>', methods=['GET'])
def get_stats(app_id):
    """
    アプリ別の成績統計を取得（将来のDB連携用）
    """
    try:
        # 将来的にDBから取得する処理
        # stats = history_logic.get_stats_from_db(app_id)

        return jsonify({
            'status': 'success',
            'data': {}
        }), 200

    except Exception as e:
        current_app.logger.error(f'Error getting stats: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500


@rireki_bp.errorhandler(404)
def not_found(error):
    """404エラーハンドラ"""
    return jsonify({'error': 'Not Found'}), 404


@rireki_bp.errorhandler(500)
def internal_error(error):
    """500エラーハンドラ"""
    current_app.logger.error(f'Internal server error: {error}')
    return jsonify({'error': 'Internal Server Error'}), 500
