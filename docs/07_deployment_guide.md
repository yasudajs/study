# 構築・デプロイ手順書

## 1. 開発環境セットアップ

### 1.1 前提条件
- Python 3.7 以上がインストールされていること
- Git がインストールされていること
- Lolipop! レンタルサーバーのアカウントがあること

### 1.2 ローカル開発環境の構築

#### ステップ 1: リポジトリのクローン
```bash
git clone <repository-url> ~/lolipop/study
cd ~/lolipop/study
```

#### ステップ 2: 仮想環境の構築
```bash
python3.7 -m venv venv
source venv/bin/activate  # Linux/Mac
# または
venv\Scripts\activate     # Windows
```

#### ステップ 3: 依存パッケージのインストール
```bash
pip install --upgrade pip
pip install Flask==2.2.5
pip install Werkzeug==2.2.3
pip install Jinja2==3.1.6
pip install requests==2.31.0
```

#### ステップ 4: ローカル Flask アプリケーションの起動
```bash
python wsgi_app.py
```

アプリケーションは `http://localhost:5000/` でポータル画面を表示し、`http://localhost:5000/kuku/` で九九練習アプリをアクセス可能。

---

## 2. プロジェクト構造の初期化

### 2.1 ディレクトリ構造の作成

```bash
mkdir -p portal/templates/portal
mkdir -p kuku/templates/kuku
mkdir -p kuku/static/{css,js/{screens,logic,utils}}
mkdir -p common/{templates,static}
mkdir -p tests
mkdir -p logs
mkdir -p database
```

### 2.2 必須ファイルの生成

#### `__init__.py`
```python
from flask import Flask
from portal import portal_bp
from kuku import kuku_bp
from config import config

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # 設定ファイルの読み込み
    app.config.from_object(config.get(config_name, config['development']))
    
    # Blueprint登録
    app.register_blueprint(portal_bp, url_prefix='/')
    app.register_blueprint(kuku_bp, url_prefix='/kuku')
    
    return app
```

#### `config.py`
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """共通設定"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key')
    DEBUG = False
    TESTING = False
    
    # MySQL設定
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', '')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'study')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
```

#### `wsgi.py`
```python
import os
from dotenv import load_dotenv

load_dotenv()

from __init__ import create_app

config_name = os.getenv('FLASK_ENV', 'development')
app = create_app(config_name)

if __name__ == '__main__':
    app.run()
```

### 2.3 requirements.txt の作成

```bash
pip freeze > requirements.txt
```

あるいは手動で作成：
```
Flask==2.2.5
Werkzeug==2.2.3
Jinja2==3.1.6
MarkupSafe==2.1.5
itsdangerous==2.1.2
click==8.1.8
mysql-connector-python==8.0.33
requests==2.31.0
python-dotenv==0.21.0
```

---

## 3. フロントエンドの実装

### 3.1 基本的な HTML テンプレート

`kuku/templates/kuku/index.html`:
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>九九練習アプリ</title>
    <link rel="stylesheet" href="{{ url_for('kuku.static', filename='css/style.css') }}">
</head>
<body>
    <div id="app"></div>
    
    <!-- スクリプト読み込み順序は重要 -->
    <script src="{{ url_for('kuku.static', filename='js/utils/helpers.js') }}"></script>
    <script src="{{ url_for('kuku.static', filename='js/logic/stateManager.js') }}"></script>
    <script src="{{ url_for('kuku.static', filename='js/logic/quizLogic.js') }}"></script>
    <script src="{{ url_for('kuku.static', filename='js/screens/startScreen.js') }}"></script>
    <script src="{{ url_for('kuku.static', filename='js/screens/levelScreen.js') }}"></script>
    <script src="{{ url_for('kuku.static', filename='js/screens/modeScreen.js') }}"></script>
    <script src="{{ url_for('kuku.static', filename='js/screens/quizScreen.js') }}"></script>
    <script src="{{ url_for('kuku.static', filename='js/screens/resultScreen.js') }}"></script>
    <script src="{{ url_for('kuku.static', filename='js/app.js') }}"></script>
    <script src="{{ url_for('kuku.static', filename='js/main.js') }}"></script>
</body>
</html>
```

### 3.2 基本的な CSS

`kuku/static/css/style.css`:
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', 'Hiragino Sans', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

#app {
    width: 100%;
    max-width: 600px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    padding: 40px;
    min-height: 400px;
}

h1, h2 {
    color: #333;
    margin-bottom: 30px;
    text-align: center;
    font-size: 32px;
}

h2 {
    font-size: 24px;
}

.button-container {
    display: flex;
    gap: 20px;
    margin-top: 30px;
    justify-content: center;
}

button {
    padding: 15px 30px;
    font-size: 18px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background: #667eea;
    color: white;
    transition: all 0.3s ease;
    flex: 1;
    max-width: 200px;
}

button:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

button:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
}

input[type="text"],
input[type="number"] {
    width: 100%;
    padding: 12px;
    margin: 15px 0;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus {
    outline: none;
    border-color: #667eea;
}

.quiz-container {
    text-align: center;
}

.quiz-problem {
    font-size: 48px;
    margin: 30px 0;
    color: #333;
}

.progress {
    text-align: center;
    margin: 20px 0;
    color: #666;
    font-size: 14px;
}

.result-display {
    text-align: center;
    margin: 40px 0;
}

.correct-rate {
    font-size: 64px;
    font-weight: bold;
    color: #667eea;
    margin: 20px 0;
}

.result-detail {
    font-size: 18px;
    color: #666;
    margin: 20px 0;
}

/* レスポンシブ */
@media (max-width: 600px) {
    #app {
        padding: 20px;
        border-radius: 0;
    }
    
    h1 {
        font-size: 24px;
    }
    
    .quiz-problem {
        font-size: 36px;
    }
    
    .button-container {
        flex-direction: column;
    }
    
    button {
        max-width: 100%;
    }
}
```

### 3.3 メインアプリケーションロジック

`kuku/static/js/main.js`:
```javascript
// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    const app = new KukuApp();
    app.init();
});

class KukuApp {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.stateManager = new StateManager();
    }
    
    init() {
        this.renderStartScreen();
    }
    
    renderStartScreen() {
        const screen = new StartScreen(this.stateManager, this);
        screen.render(this.appContainer);
    }
    
    renderLevelScreen() {
        const screen = new LevelScreen(this.stateManager, this);
        screen.render(this.appContainer);
    }
    
    renderModeScreen() {
        const screen = new ModeScreen(this.stateManager, this);
        screen.render(this.appContainer);
    }
    
    renderQuizScreen() {
        const screen = new QuizScreen(this.stateManager, this);
        screen.render(this.appContainer);
    }
    
    renderResultScreen() {
        const screen = new ResultScreen(this.stateManager, this);
        screen.render(this.appContainer);
    }
    
    changeScreen(screenName) {
        if (screenName === 'level') this.renderLevelScreen();
        else if (screenName === 'mode') this.renderModeScreen();
        else if (screenName === 'quiz') this.renderQuizScreen();
        else if (screenName === 'result') this.renderResultScreen();
        else if (screenName === 'start') this.renderStartScreen();
    }
}
```

---

## 4. バックエンド API の実装

### 4.1 Flask ルート定義

`kuku/routes.py`:
```python
from flask import request, jsonify, render_template
from kuku import kuku_bp
from kuku.logic import QuizLogic
import uuid
import json

# セッション管理用（簡易版）
sessions = {}

@kuku_bp.route('/', methods=['GET'])
def index():
    """フロントエンド HTML を返す"""
    return render_template('kuku/index.html')

@kuku_bp.route('/start', methods=['GET'])
def start():
    """アプリ開始"""
    return jsonify({'status': 'ready'}), 200

@kuku_bp.route('/quiz', methods=['POST'])
def get_quiz():
    """出題リスト取得"""
    data = request.get_json()
    levels = data.get('levels', [])
    mode = data.get('mode', 'sequential')
    
    # バリデーション
    if not levels or not all(1 <= l <= 9 for l in levels):
        return jsonify({'error': 'Invalid levels'}), 400
    
    if mode not in ['sequential', 'random']:
        return jsonify({'error': 'Invalid mode'}), 400
    
    # 問題リスト生成
    logic = QuizLogic(levels, mode)
    quiz_list = logic.generate_quizzes()
    
    # セッション作成
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        'levels': levels,
        'mode': mode,
        'quizzes': quiz_list,
        'answers': []
    }
    
    return jsonify({
        'quiz_list': quiz_list,
        'session_id': session_id,
        'total_count': len(quiz_list)
    }), 200

@kuku_bp.route('/submit', methods=['POST'])
def submit_answer():
    """回答送信"""
    data = request.get_json()
    session_id = data.get('session_id')
    quiz_id = data.get('quiz_id')
    user_answer = data.get('user_answer')
    
    if session_id not in sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    session = sessions[session_id]
    
    # 問題を検索
    quiz = next((q for q in session['quizzes'] if q['id'] == quiz_id), None)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    # 採点
    is_correct = (user_answer == quiz['correct_answer'])
    
    # 回答を記録
    session['answers'].append({
        'quiz_id': quiz_id,
        'user_answer': user_answer,
        'is_correct': is_correct
    })
    
    return jsonify({
        'quiz_id': quiz_id,
        'is_correct': is_correct,
        'correct_answer': quiz['correct_answer']
    }), 200

@kuku_bp.route('/result/<session_id>', methods=['GET'])
def get_result(session_id):
    """結果表示"""
    if session_id not in sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    session = sessions[session_id]
    answers = session['answers']
    
    correct_count = sum(1 for a in answers if a['is_correct'])
    total_count = len(answers)
    correct_rate = round((correct_count / total_count * 100) if total_count > 0 else 0)
    
    return jsonify({
        'correct_count': correct_count,
        'total_count': total_count,
        'correct_rate': correct_rate,
        'levels': session['levels'],
        'mode': session['mode']
    }), 200
```

### 4.2 ビジネスロジック

`kuku/logic.py`:
```python
import random

class QuizLogic:
    """九九クイズロジック"""
    
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
                    'correct_answer': level * multiplier
                }
                quizzes.append(quiz)
                quiz_id += 1
        
        # ランダムモードの場合
        if self.mode == 'random':
            random.shuffle(quizzes)
        
        return quizzes
```

---

## 5. 本番環境へのデプロイ（Lolipop!）

### 5.1 Lolipop! での初期設定

1. **Lolipop! コントロールパネルで Python 3.7 を有効化**
2. **SSH アクセスを有効化**
3. **ドメイン設定を完了**

### 5.2 本番環境へのデプロイ手順

#### ステップ 1: Lolipop! サーバーへの接続
```bash
ssh your-account@lolipop.jp
```

#### ステップ 2: ディレクトリ移動
```bash
cd ~/www/lolipop/study
```

#### ステップ 3: ソースコードの配置
```bash
git clone <repository-url> .
# または既存リポジトリの場合
git pull origin main
```

#### ステップ 4: 仮想環境の構築
```bash
python3.7 -m venv venv
source venv/bin/activate
```

#### ステップ 5: 依存パッケージのインストール
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### ステップ 6: 環境変数の設定
```bash
cp .env.example .env
# .env を編集（Lolipop! の MySQL 情報を入力）
```

環境変数例（Lolipop!）:
```
FLASK_ENV=production
FLASK_APP=wsgi:app
SECRET_KEY=your-secret-key-here
MYSQL_HOST=localhost
MYSQL_USER=lolipop_user
MYSQL_PASSWORD=lolipop_password
MYSQL_DB=study_db
MYSQL_PORT=3306
```

#### ステップ 7: データベーステーブルの作成
```bash
python3.7 << 'EOF'
import mysql.connector
from app.config import config

cfg = config['production']
conn = mysql.connector.connect(
    host=cfg.MYSQL_HOST,
    user=cfg.MYSQL_USER,
    password=cfg.MYSQL_PASSWORD,
    port=cfg.MYSQL_PORT
)
cursor = conn.cursor()

# データベース作成
cursor.execute(f"CREATE DATABASE IF NOT EXISTS {cfg.MYSQL_DB}")

# テーブル作成
cursor.execute(f"USE {cfg.MYSQL_DB}")
cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_sessions (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        app_type VARCHAR(50) NOT NULL,
        levels JSON NOT NULL,
        mode VARCHAR(20) NOT NULL,
        correct_count INT DEFAULT 0,
        total_count INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active'
    )
""")

conn.commit()
cursor.close()
conn.close()
print("Database and tables created successfully")
EOF
```

#### ステップ 8: Lolipop! での WSGI 設定

Lolipop! のコントロールパネルで、`wsgi.py` を WSGI アプリケーション のエントリーポイントとして設定。

#### ステップ 9: アプリケーションの起動

```bash
# 本番環境での起動（gunicorn推奨）
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:8000 wsgi:app &
```

あるいは、Lolipop! コントロールパネルから自動起動設定。

### 5.3 HTTPS設定

Lolipop! の SSL 証明書設定を有効化。

### 5.4 ドメイン設定

ドメインのDNS設定を Lolipop! ネームサーバーに指定。

---

## 6. デプロイ後の確認

### 6.1 アプリケーションのテスト

```bash
# ヘルスチェック
curl https://your-domain.jp/kuku/api/quiz

# 期待される応答
# {"status": "ready"}
```

### 6.2 ログの確認

```bash
tail -f ~/www/lolipop/study/logs/app.log
```

### 6.3 エラーの確認

```bash
# MySQL 接続確認
python3.7 -c "from app import create_app; app = create_app('production'); print('OK')"
```

---

## 7. トラブルシューティング

| 問題 | 原因 | 解決方法 |
|------|------|---------|
| モジュールが見つからない | 仮想環境が有効化されていない | `source venv/bin/activate` を実行 |
| MySQL 接続エラー | 接続情報が不正 | `.env` ファイルの MySQL 情報を確認 |
| WSGI エラー | Python パスが不正 | Lolipop! コントロールパネルで Python 3.7 パスを確認 |
| 静的ファイルが見つからない | URL プレフィックスが不正 | Flask の `url_for` を使用してパスを生成 |

---

## 8. 本番環境チェックリスト

デプロイ前に確認：

- [ ] Python 3.7 が Lolipop! に正しくインストールされている
- [ ] すべての必須 Python モジュールがインストールされている
- [ ] MySQL データベースが作成され、接続できる
- [ ] .env ファイルで本番用の設定が入力されている
- [ ] HTTPS (SSL) が有効になっている
- [ ] ドメインが正しく設定されている
- [ ] API エンドポイントが動作している
- [ ] フロントエンド HTML が正しく配信されている
- [ ] ログファイルの出力パスが正しい
- [ ] バックアップ戦略が策定されている
- [ ] パフォーマンス測定（負荷試験）を実施
