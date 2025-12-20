# サーバー環境・デプロイ仕様書（現行構成）

## 1. デプロイ環境仕様

### 1.1 ホスティング環境
| 項目 | 仕様 |
|------|------|
| **ホスティング** | Lolipop! レンタルサーバー |
| **プラン** | ハイスピードプラン |
| **Webサーバー** | Nginx + LiteSpeed |
| **Python** | Python 3.7 |
| **HTTP/2対応** | Yes（LiteSpeed使用） |
| **キャッシュ機能** | LiteSpeed キャッシュ対応 |
| **データベース** | SQLite 3（内蔵） |

### 1.2 利用可能なPythonモジュール
Lolipop! ハイスピードプランで利用可能なモジュール：
```
Flask 2.2.5
Werkzeug 2.2.3
Jinja2 3.1.6
MarkupSafe 2.1.5
itsdangerous 2.1.2
click 8.1.8
requests 2.31.0
numpy 1.21.6
pandas 1.3.5
Pillow 9.5.0
```

※ SQLite 3 は Python に内蔵されているため、追加インストール不要
※ その他利用可能モジュール全一覧は `docs/requirements_server.txt` 参照

---

## 2. バックエンド技術スタック

### 2.1 フレームワーク・言語構成

| 層 | 技術 | バージョン | 用途 |
|----|------|-----------|------|
| **フレームワーク** | Flask | 2.2.5 | マイクロフレームワーク、ルーティング |
| **言語** | Python | 3.7 | サーバーサイドロジック |
| **テンプレート** | Jinja2 | 3.1.6 | HTML テンプレート（必要に応じて） |
| **データベース** | SQLite | 3（Python内蔵） | データ永続化 |
| **DB API** | sqlite3 | 3（Python内蔵） | SQLite接続 |
| **HTTP クライアント** | requests | 2.31.0 | 外部API呼び出し |

### 2.2 主要ライブラリ
- **Flask**: マイクロフレームワーク、ルーティング
- **Werkzeug**: WSGI アプリケーションツール
- **Jinja2**: テンプレートエンジン
- **sqlite3**: SQLite ドライバー（Python内蔵）

### 2.3 現行ディレクトリ構成（簡易）
```
study/
├── wsgi_app.py
├── index.cgi
├── config.py
├── app/
│   ├── portal/ {__init__.py, routes.py, logic.py}
│   ├── kuku/   {__init__.py, routes.py, models.py}
│   ├── shisoku/{__init__.py, routes.py}
│   ├── common/ {__init__.py, db.py, utils.py}
│   ├── static/ {css/, js/, images/, manifest.json, sw.js}
│   └── templates/ {base.html, portal/index.html, kuku/index.html, shisoku/index.html}
├── docs/ {00〜07, requirements_server.txt}
└── data/ {study.db}
```

---

## 3. プロジェクトディレクトリ構造

### 3.1 ハイスピードプランのディレクトリ構成

```
~/www/lolipop/study/
├── __init__.py                    # Flaskアプリケーション初期化
├── config.py                      # 設定ファイル（DB接続、秘密鍵など）
├── db.py                          # データベース管理モジュール
│
├── portal/                        # ポータル画面（学習アプリ一覧）
│   ├── __init__.py               # Blueprint初期化
│   ├── routes.py                 # ルート定義
│   ├── logic.py                  # ビジネスロジック
│   └── templates/
│       └── portal/
│           ├── index.html        # アプリ一覧画面
│           └── base.html
│
├── kuku/                         # 九九練習アプリ Blueprint
│   ├── __init__.py
│   ├── routes.py                 # ルート定義（エンドポイント）
│   ├── models.py                 # データモデル（ORM等）
│   ├── logic.py                  # ビジネスロジック
│   └── templates/
│       └── kuku/
│           ├── index.html
│           ├── base.html
│           └── ...
│
├── common/                        # 共通モジュール（全アプリで使用）
│   ├── __init__.py
│   ├── utils.py                  # 共通ユーティリティ関数
│   ├── decorators.py             # デコレーター（認証など）
│   ├── validators.py             # バリデーション関数
│   └── constants.py              # 定数定義
│
├── static/                        # 静的ファイル（共有）
│   ├── css/
│   │   ├── common.css
│   │   └── portal.css            # ポータル画面用スタイル
│   ├── js/
│   │   └── common.js
│   └── images/
│       └── app_icons/            # アプリアイコン
│
├── templates/                     # ベーステンプレート
│   └── base.html
│
├── migrations/                    # DBマイグレーション（将来導入）
│
├── tests/                         # テストディレクトリ
│   ├── __init__.py
│   ├── test_kuku.py
│   ├── test_portal.py
│   ├── conftest.py
│   └── fixtures/
│
├── wsgi_app.py                    # WSGI エントリーポイント（CGI互換）
├── requirements.txt               # Pythonパッケージ依存関係
├── .env.example                   # 環境変数テンプレート
├── .gitignore
├── README.md
└── docs/                          # ドキュメント
    ├── 00_specification.md
    ├── 01_requirements.md
    ├── 02_screen_design.md
    ├── 03_functional_requirements.md
    ├── 04_technical_design.md
    ├── 05_user_flow.md
    ├── 06_server_architecture.md (本ドキュメント)
    ├── 07_deployment_guide.md
    └── requirements_server.txt
```

### 3.2 将来のアプリ追加時の構成

新しいアプリ（例：割り算練習アプリ）を追加する場合：

```
~/www/lolipop/study/
├── portal/                    # ポータル画面（アプリ一覧）
│   ├── __init__.py
│   ├── routes.py
│   └── templates/
│       └── portal/
│           └── index.html    # 全アプリ一覧を表示
│
├── kuku/                      # 既存：九九（掛け算）練習
│   ├── __init__.py
│   ├── routes.py
│   ├── models.py
│   └── templates/
│       └── kuku/
│
├── warizan/                   # 新規：割り算練習
│   ├── __init__.py
│   ├── routes.py
│   ├── models.py
│   ├── logic.py
│   └── templates/
│       └── warizan/
│
├── tashizan/                  # 将来：足し算練習
│   ├── __init__.py
│   ├── routes.py
│   └── templates/
│       └── tashizan/
│
├── hikizan/                   # 将来：引き算練習
│   ├── __init__.py
│   ├── routes.py
│   └── templates/
│       └── hikizan/
│
└── common/                    # 共有モジュール（全アプリで使用）
    ├── __init__.py
    ├── utils.py
    ├── validators.py
    └── decorators.py
```

---

## 4. Flaskアプリケーション構造

### 4.1 アプリケーション初期化（__init__.py）

```python
from flask import Flask
from portal import portal_bp
from kuku import kuku_bp
from common.utils import init_logger

def create_app(config_name='development'):
    """Flaskアプリケーションファクトリ"""
    app = Flask(__name__, 
                template_folder='templates',
                static_folder='static')
    
    # 設定ファイルの読み込み
    from config import config
    app.config.from_object(config[config_name])
    
    # ロギング設定
    init_logger(app)
    
    # Blueprint登録
    # ポータル画面（ルート）
    app.register_blueprint(portal_bp, url_prefix='/')
    
    # 各学習アプリ
    app.register_blueprint(kuku_bp, url_prefix='/kuku')
    
    # エラーハンドラ登録
    register_error_handlers(app)
    
    return app

def register_error_handlers(app):
    """エラーハンドラの登録"""
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not Found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal Server Error'}, 500
```

### 4.2 設定管理（config.py）

```python
import os

class Config:
    """共通設定"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    DEBUG = False
    TESTING = False
    
    # SQLite接続設定
    DATABASE = os.getenv('DATABASE_PATH', 'data/study.db')
    
    # セッション設定
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

class DevelopmentConfig(Config):
    """開発環境設定"""
    DEBUG = True
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    """本番環境設定"""
    DEBUG = False

def get_config(env=None):
    """環境に応じた設定を取得"""
    if env is None:
        env = os.getenv('FLASK_ENV', 'development')
    
    config_map = {
        'development': DevelopmentConfig,
        'production': ProductionConfig,
        'testing': DevelopmentConfig,
    }
    
    return config_map.get(env, DevelopmentConfig)
```

**補注**: 本番環境（Lolipop!）では `.env` ファイルを使用せず、`os.getenv()` のみで環境変数を読み取ります。

### 4.3 ポータル画面 Blueprint（portal/__init__.py）

```python
from flask import Blueprint

portal_bp = Blueprint(
    'portal',
    __name__,
    url_prefix='/',
    template_folder='templates'
)

from portal import routes
```

### 4.3.1 ポータル画面ルート（portal/routes.py）

```python
from flask import render_template
from portal import portal_bp
from portal.logic import get_available_apps

@portal_bp.route('/', methods=['GET'])
def index():
    """ポータル画面（アプリ一覧）を表示"""
    apps = get_available_apps()
    return render_template('portal/index.html', apps=apps)
```

### 4.3.2 ポータル画面ロジック（portal/logic.py）

```python
def get_available_apps():
    """
    利用可能な学習アプリの一覧を取得
    """
    apps = [
        {
            'id': 'kuku',
            'name': '九九練習',
            'description': '1×1～9×9の九九を練習します',
            'icon': '/static/images/app_icons/kuku.png',
            'url': '/kuku/',
            'level': '小学1～3年生'
        },
        # 将来：わり算、たし算、ひき算アプリなど
        # {
        #     'id': 'warizan',
        #     'name': '割り算練習',
        #     'description': '割り算の計算を練習します',
        #     'icon': '/static/images/app_icons/warizan.png',
        #     'url': '/warizan/',
        #     'level': '小学3～4年生'
        # },
        # {
        #     'id': 'tashizan',
        #     'name': '足し算練習',
        #     'description': '足し算の計算を練習します',
        #     'icon': '/static/images/app_icons/tashizan.png',
        #     'url': '/tashizan/',
        #     'level': '小学1～2年生'
        # },
        # {
        #     'id': 'hikizan',
        #     'name': '引き算練習',
        #     'description': '引き算の計算を練習します',
        #     'icon': '/static/images/app_icons/hikizan.png',
        #     'url': '/hikizan/',
        #     'level': '小学2～3年生'
        # }
    ]
    return apps
```

### 4.3.3 ポータル画面テンプレート（portal/templates/portal/index.html）

```html
{% extends "base.html" %}

{% block title %}学習アプリポータル{% endblock %}

{% block content %}
<div class="portal-container">
    <h1>学習アプリポータル</h1>
    <p class="subtitle">学びたい学習アプリを選択してください</p>
    
    <div class="apps-grid">
        {% for app in apps %}
        <div class="app-card">
            <a href="{{ app.url }}" class="app-link">
                <img src="{{ app.icon }}" alt="{{ app.name }}" class="app-icon">
                <h2 class="app-name">{{ app.name }}</h2>
                <p class="app-description">{{ app.description }}</p>
                <p class="app-level">対象：{{ app.level }}</p>
            </a>
        </div>
        {% endfor %}
    </div>
</div>

<style>
.portal-container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 20px;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 10px;
    font-size: 32px;
}

.subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 40px;
    font-size: 16px;
}

.apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.app-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
}

.app-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}

.app-link {
    display: block;
    padding: 20px;
    text-decoration: none;
    color: inherit;
}

.app-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 15px;
    border-radius: 10px;
    background: #f0f0f0;
}

.app-name {
    font-size: 20px;
    color: #333;
    margin: 10px 0;
}

.app-description {
    color: #666;
    font-size: 14px;
    margin-bottom: 10px;
}

.app-level {
    color: #999;
    font-size: 12px;
    margin-top: 15px;
}
</style>
{% endblock %}
```

### 4.4 九九 Blueprint初期化（kuku/__init__.py）

```python
from flask import Blueprint

kuku_bp = Blueprint(
    'kuku',
    __name__,
    url_prefix='/kuku',
    static_folder='static',
    static_url_path='/static',
    template_folder='templates'
)

from kuku import routes
```

### 4.5 九九 ルート定義（kuku/routes.py） - クライアント側処理最小化版

```python
from flask import request, jsonify, render_template
from kuku import kuku_bp
from kuku.models import QuizSession
import uuid

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
    
    # バリデーション
    levels = data.get('levels', [])
    mode = data.get('mode', 'sequential')
    
    if not levels or not all(1 <= l <= 9 for l in levels):
        return jsonify({'error': 'Invalid levels'}), 400
    
    if mode not in ['sequential', 'random']:
        return jsonify({'error': 'Invalid mode'}), 400
    
    # セッション作成（問題生成はクライアント側で実施）
    session = QuizSession(levels=levels, mode=mode)
    session.save()
    
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
    
    session_id = data.get('session_id')
    correct_count = data.get('correct_count')
    total_count = data.get('total_count')
    correct_rate = data.get('correct_rate')
    
    # バリデーション
    if not session_id or correct_count is None or total_count is None:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # セッション取得と結果更新
    session = QuizSession.get_by_id(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # 結果をセッションに保存
    session.update_result(correct_count, total_count, correct_rate)
    session.mark_completed()
    
    return jsonify({
        'success': True,
        'message': 'Result saved successfully',
        'session_id': session_id
    }), 200
        'correct_rate': result['correct_rate'],
        'levels': session.levels,
        'mode': session.mode
    }), 200
```

### 4.6 ビジネスロジック（kuku/logic.py）

```python
import random
from common.utils import shuffle_array

class QuizLogic:
    """九九クイズのロジック"""
    
    def __init__(self, levels, mode):
        self.levels = sorted(levels)
        self.mode = mode
    
    def generate_quizzes(self):
        """問題リスト生成"""
        quizzes = []
        quiz_id = 1
        
        for level in self.levels:
            for multiplier in range(1, 10):
                quiz = {
                    'id': quiz_id,
                    'multiplicand': level,
                    'multiplier': multiplier,
                    'correct_answer': level * multiplier,
                    'user_answer': None,
                    'is_correct': None
                }
                quizzes.append(quiz)
                quiz_id += 1
        
        # ランダムモードの場合はシャッフル
        if self.mode == 'random':
            quizzes = shuffle_array(quizzes)
        
        return quizzes

class Scorer:
    """採点ロジック"""
    
    @staticmethod
    def score_answer(user_answer, correct_answer):
        """単一問題の採点"""
        return user_answer == correct_answer
    
    @staticmethod
    def calculate_rate(correct_count, total_count):
        """正答率計算"""
        if total_count == 0:
            return 0
        return round((correct_count / total_count) * 100)
```

---

## 5. データベース設計

### 5.1 テーブル構成（最小化版）

クライアント側で全ての問題生成・採点を実施するため、
サーバー側は**セッション管理と最終結果の記録のみ**を行います。

```sql
-- クイズセッションテーブル
CREATE TABLE quiz_sessions (
    id TEXT PRIMARY KEY,                 -- UUID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    app_type TEXT NOT NULL,              -- 'kuku', 'warizan', 'tashizan', etc.
    levels TEXT NOT NULL,                -- JSON: [2, 3, 5]
    mode TEXT NOT NULL,                  -- 'sequential' or 'random'
    correct_count INTEGER DEFAULT 0,     -- クライアント側で計算された正答数
    total_count INTEGER DEFAULT 0,       -- クライアント側で計算された全問数
    status TEXT DEFAULT 'active'         -- 'active', 'completed'
);
```

**注：** 旧`quiz_answers`テーブルは削除。
クライアント側のメモリとlocalStorageで全ての回答を管理し、
最後に最終結果のみをサーバーに保存するため、
個別の回答履歴をサーバーに保存する必要がありません。

### 5.2 Python モデル（kuku/models.py） - クライアント側処理対応版

```python
import sqlite3
from datetime import datetime
import uuid
import json

class QuizSession:
    """
    クイズセッションモデル
    
    クライアント側で全ての問題生成・採点が完了した後、
    最終結果のみをサーバーに保存します。
    """
    
    def __init__(self, levels, mode, app_type='kuku'):
        self.id = str(uuid.uuid4())
        self.app_type = app_type
        self.levels = levels
        self.mode = mode
        self.correct_count = 0
        self.total_count = 0
        self.correct_rate = 0
        self.status = 'active'  # 'active' or 'completed'
        self.created_at = datetime.now()
    
    def save(self):
        """
        セッションを作成（初期化のみ）
        クライアント側で問題生成・採点を行うため、
        詳細情報はまだ保存しません。
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            INSERT INTO quiz_sessions 
            (id, app_type, levels, mode, status)
            VALUES (?, ?, ?, ?, ?)
            """,
            (self.id, self.app_type, json.dumps(self.levels), 
             self.mode, self.status)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
    
    def update_result(self, correct_count, total_count, correct_rate):
        """
        クライアント側で計算した結果を更新
        
        Args:
            correct_count: 正答数
            total_count: 全問数
            correct_rate: 正答率（パーセント）
        """
        self.correct_count = correct_count
        self.total_count = total_count
        self.correct_rate = correct_rate
    
    def mark_completed(self):
        """セッションを完了状態に変更"""
        self.status = 'completed'
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            UPDATE quiz_sessions 
            SET status = ?, correct_count = ?, total_count = ?
            WHERE id = ?
            """,
            (self.status, self.correct_count, self.total_count, self.id)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
    
    @staticmethod
    def get_by_id(session_id):
        """セッションを取得"""
        from flask import current_app
        import os
        
        db_path = current_app.config.get('DATABASE', 'data/study.db')
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT * FROM quiz_sessions WHERE id = ?",
            (session_id,)
        )
        
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not row:
            return None
        
        session = QuizSession(
            levels=json.loads(row['levels']),
            mode=row['mode']
        )
        session.id = row['id']
        session.correct_count = row['correct_count']
        session.total_count = row['total_count']
        session.status = row['status']
        
        return session
    
    @staticmethod
    def get_db_connection():
        """SQLite接続"""
        from flask import current_app
        import os
        
        db_path = current_app.config.get('DATABASE', 'data/study.db')
        os.makedirs(os.path.dirname(db_path) or '.', exist_ok=True)
        return sqlite3.connect(db_path)
```

---

## 6. API エンドポイント設計

### 6.1 設計方針：クライアント側での処理最大化

**30人同時アクセス対応のため、サーバー側APIを最小化します：**

| 処理内容 | 実行場所 | 詳細 |
|--------|--------|------|
| **問題生成** | **クライアント側（JavaScript）** | サーバーから問題データを受け取らず、クライアント側で全問題を生成。Fisher-Yates shuffle で順序をシャッフル |
| **採点・スコア計算** | **クライアント側（JavaScript）** | 回答判定と正答率計算を全てクライアント側で実施。サーバーに送信しない |
| **セッション管理** | **サーバー側（Flask）** | セッション作成（1回）とクイズ結果保存（1回）のみサーバーで処理 |

**結果：APIコール削減**
- 従来：30人 × 9問 = 270回の採点APIコール（サーバー処理）
- 最適化後：30人 × 2回 = 60回のAPIコール（セッション作成1回 + 結果保存1回）
- **削減率：80%（99.7% API削減）**

### 6.2 九九練習 API（最小化版）

| メソッド | エンドポイント | 説明 | リクエスト | レスポンス |
|---------|-------------|------|-----------|-----------|
| GET | `/kuku/` | アプリ画面を表示 | - | HTML画面 |
| POST | `/kuku/api/session` | **セッション作成**（クライアント側で問題を生成するための準備） | `{ levels: [...], mode: '...' }` | `{ session_id: '...', message: 'Session created' }` |
| POST | `/kuku/api/result` | **結果保存**（クライアント側で計算した最終結果を保存） | `{ session_id: '...', correct_count: n, total_count: n, correct_rate: n }` | `{ success: true, message: 'Result saved' }` |

### 6.3 削除されたエンドポイント（クライアント側で処理するため不要）

以下のエンドポイントは**削除**されました。これらの処理はクライアント側のJavaScriptで実施されます：

- `POST /kuku/api/quiz`（出題）→ クライアント側で問題を生成
- `POST /kuku/api/submit`（回答送信）→ クライアント側で採点・判定
- `GET /kuku/api/result/<session_id>`（結果取得）→ クライアント側で計算

### 6.4 レスポンス形式

#### セッション作成 - 成功時
```json
{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Session created",
    "timestamp": "2024-01-15T10:30:45Z"
}
```

#### 結果保存 - 成功時
```json
{
    "success": true,
    "message": "Result saved successfully",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-15T10:35:20Z"
}
```

#### エラー時
```json
{
    "error": "Invalid levels",
    "status": 400
}
```

---

## 7. セキュリティ考慮

### 7.1 実装項目

| 項目 | 対策 |
|------|------|
| **CORS** | Flask-CORS で設定（必要に応じて） |
| **CSRF保護** | POST リクエストでトークン検証 |
| **入力検証** | levels (1-9)、mode ('sequential' or 'random') |
| **SQL インジェクション対策** | プリペアドステートメント使用 |
| **HTTPS** | 本番環境では必須（Lolipop SSL対応） |
| **セッション管理** | secure, httponly, samesite クッキー |
| **レート制限** | Flask-Limiter で API レート制限（オプション） |

### 7.2 環境変数設定（.env.example）

```
FLASK_ENV=production
FLASK_APP=wsgi:app
SECRET_KEY=your-secret-key-here
DATABASE_PATH=data/study.db
LOG_LEVEL=INFO
```

---

## 8. デプロイプロセス

### 8.1 Lolipop! でのセットアップ手順

1. **Python環境準備**
```bash
# Lolipop コントロールパネルで Python 3.7 を有効化
# SSHアクセス有効化
```

2. **ソースコード配置**
```bash
ssh your-account@lolipop.jp
cd ~/www/lolipop/study
git clone <repository-url> .
```

3. **仮想環境構築**
```bash
python3.7 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. **環境変数設定**
```bash
cp .env.example .env
# .env を編集（データベースパスなど）
```

5. **データベース初期化**
```bash
mkdir -p data
python3.7 -c "from __init__ import create_app; from common.db import init_db; app = create_app(); init_db(app)"
```

6. **WSGI設定（.htaccess / Lolipop設定）**
```
# Lolipop! ハイスピードプランで WSGI アプリ設定
```

7. **Nginxリバースプロキシ設定**
```nginx
server {
    listen 80;
    server_name study.example.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.2 アプリサーバー起動

```bash
# 開発環境
python wsgi.py

# 本番環境（gunicorn 使用）
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:8000 wsgi:app
```

---

## 9. 監視・ログ管理

### 9.1 ロギング設定

```python
# common/utils.py
import logging
from logging.handlers import RotatingFileHandler
import os

def init_logger(app):
    """ログ初期化"""
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        file_handler = RotatingFileHandler(
            'logs/app.log',
            maxBytes=10240000,
            backupCount=10
        )
        
        formatter = logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(logging.INFO)
        
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Application startup')
```

### 9.2 主要ログ出力箇所

- アプリケーション起動/停止
- API エンドポイント呼び出し
- エラー発生
- クイズ結果（分析用）

---

## 10. スケーラビリティ・今後の拡張

### 10.1 アプリ追加時の手順

新しいアプリ（例：割り算練習 (warizan)）を追加する場合：

1. **フォルダ作成**
```bash
mkdir -p warizan/templates/warizan
touch warizan/__init__.py
touch warizan/routes.py
touch warizan/models.py
touch warizan/logic.py
```

2. **Blueprint登録** (__init__.py)
```python
from warizan import warizan_bp
app.register_blueprint(warizan_bp, url_prefix='/warizan')
```

3. **テーブル追加** (MySQL)
```sql
-- 既存テーブルは app_type カラムで判別
-- warizan アプリも同じテーブル構造を使用
```

### 10.2 将来の拡張オプション

- **認証機能**: Flask-Login で ユーザー登録・ログイン
- **成績管理**: ユーザーごとの学習進捗記録
- **キャッシング**: Redis で セッション・クエリキャッシュ
- **タスク管理**: Celery で 非同期処理
- **API ドキュメント**: Flask-RESTX で Swagger 自動生成

---

## 11. 本番環境チェックリスト

デプロイ前の確認項目：

- [ ] Python 3.7 のインストール確認
- [ ] 必要な Pythonモジュール インストール完了
- [ ] MySQL データベース作成・テーブル初期化
- [ ] .env ファイルで本番用設定入力
- [ ] HTTPS (SSL証明書) 設定
- [ ] ロギング設定確認
- [ ] セキュリティヘッダー設定
- [ ] CORS ポリシー確認
- [ ] API テスト実行
- [ ] パフォーマンステスト（負荷試験）
- [ ] バックアップ戦略策定
