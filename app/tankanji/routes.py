"""
単漢字練習 - ルート定義
"""
import json
from flask import render_template, jsonify
from app.common.kanji_loader import KanjiLoader
from . import tankanji_bp


@tankanji_bp.route('/', methods=['GET'])
def index():
    """単漢字練習アプリのメイン画面"""
    return render_template('tankanji/index.html')


@tankanji_bp.route('/api/kanji-data', methods=['GET'])
def get_kanji_data():
    """全漢字データをJSON形式で返す"""
    try:
        data = KanjiLoader.load()
        return jsonify({
            'status': 'success',
            'data': data,
            'total': len(data)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
