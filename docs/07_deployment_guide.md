# 構築・デプロイ手順書（現行構成）

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

#### ステップ 2: 仮想環境の構築（venv37）

Windows（PowerShell）:
```bash
python -m venv venv37
venv37\Scripts\Activate.ps1
```

Windows（cmd.exe）:
```bat
python -m venv venv37
venv37\Scripts\activate.bat
```

Linux/macOS（bash/zsh）:
```bash
python3 -m venv venv37
source venv37/bin/activate
```

#### ステップ 3: 依存パッケージのインストール（サーバー互換）
```bash
pip install --upgrade pip
pip install Flask==2.2.5 Werkzeug==2.2.3 Jinja2==3.1.6 itsdangerous==2.1.2 click==8.1.8
```

#### ステップ 4: ローカル Flask アプリケーションの起動
```bash
python wsgi_app.py
```

アプリケーションは `http://localhost:5000/` でポータル画面を表示し、`/kuku/`・`/shisoku/` へアクセス可能。

---

## 2. プロジェクト構造の初期化

### 2.1 ディレクトリ構造（現行実装）
```
app/portal, app/kuku, app/shisoku, app/common
app/static/{css,js,images,manifest.json,sw.js}
app/templates/{base.html, portal/index.html, kuku/index.html, shisoku/index.html}
wsgi_app.py, config.py, index.cgi, data/
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

#### `config.py`（dotenv 不使用、os.getenv のみ）
```python
import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    DEBUG = False
    TESTING = False

    # ログ設定
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True

# 設定マップ
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}

def get_config(name='development'):
    return config_map.get(name, DevelopmentConfig)
```

#### `wsgi_app.py`（CGI互換のWSGIアプリ）
```python
from flask import Flask
import os

if 'SCRIPT_NAME' in os.environ:
    os.environ['SCRIPT_NAME'] = ''

app = Flask(__name__,
            template_folder=os.path.join(os.path.dirname(__file__), 'app', 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), 'app', 'static'))

app.config['APPLICATION_ROOT'] = '/'
app.secret_key = os.getenv('SECRET_KEY', 'dev-key-change-in-production')

from app.portal import portal_bp
from app.kuku import kuku_bp
from app.shisoku import shisoku_bp
app.register_blueprint(portal_bp, url_prefix='/')
app.register_blueprint(kuku_bp, url_prefix='/kuku')
app.register_blueprint(shisoku_bp, url_prefix='/shisoku')
```

### 2.3 requirements.txt の作成

```bash
pip freeze > requirements.txt
```

あるいは `docs/requirements_server.txt` を参照（本番サーバーの互換モジュール一覧）

---

## 3. フロントエンドの実装（現行方針）

クライアント側で「問題生成・採点・正答率計算」を完結させます。サーバー API はセッション作成と結果保存に限定します。

### 3.1 テンプレート構成
- ベース: [app/templates/base.html](app/templates/base.html)
- 九九: [app/templates/kuku/index.html](app/templates/kuku/index.html)
- 四則演算: [app/templates/shisoku/index.html](app/templates/shisoku/index.html)
- ポータル: [app/templates/portal/index.html](app/templates/portal/index.html)

### 3.2 静的ファイル
- スタイル: [app/static/css/style.css](app/static/css/style.css), [app/static/css/responsive.css](app/static/css/responsive.css)
- 画像: [app/static/images/](app/static/images)
- JavaScript: 
  - 九九: [app/static/js/main.js](app/static/js/main.js), [app/static/js/quizLogic.js](app/static/js/quizLogic.js), [app/static/js/scorer.js](app/static/js/scorer.js)
  - 四則演算: [app/static/js/shisokuLogic.js](app/static/js/shisokuLogic.js)
  - PWA: [app/static/js/pwa.js](app/static/js/pwa.js), [app/static/manifest.json](app/static/manifest.json), [app/static/sw.js](app/static/sw.js)

### 3.3 入力方式（テンキー）
- 入力フィールドは DOM に持たず、内部状態 `currentAnswer` で管理します。
- 数字ボタンで `addNumberToInput(number)`、削除で `clearNumberInput()`、採点は `submitAnswer()` で実施。
- 入力値はテンプレート内の「a × b = ?」などの `?` 表示へリアルタイム反映。

### 3.4 PWA
- Service Worker と Manifest を有効化。オフライン時も基本画面を配信。
- ルートに対するキャッシュ戦略は [app/static/sw.js](app/static/sw.js) を参照。

---

## 4. バックエンド構成（CGI/WSGI）

本プロジェクトは Lolipop! の CGI 環境で動作します。WSGI アプリは [index.cgi](index.cgi) から [wsgi_app.py](wsgi_app.py) を介して起動されます。

### 4.1 エントリーポイント
- CGI: [index.cgi](index.cgi)（Shebang: `/usr/local/bin/python3.7`、`CGIHandler().run(app)`）
- WSGI: [wsgi_app.py](wsgi_app.py)
  - `SCRIPT_NAME` リセット、`APPLICATION_ROOT` を `/` に設定
  - Blueprint を登録（`/`、`/kuku`、`/shisoku`）

### 4.2 ルート定義（最小）
- ポータル: [app/portal/routes.py](app/portal/routes.py) — `index()` でテンプレート配信
- 九九: [app/kuku/routes.py](app/kuku/routes.py) — `index()`（テンプレート配信）、`/api/session`・`/api/result`（任意・最小）
- 四則演算: [app/shisoku/routes.py](app/shisoku/routes.py) — `index()` でテンプレート配信

出題・採点はクライアント側で行うため、サーバーの API はセッション作成と結果保存のみ（必要時）。

---

## 5. 本番環境へのデプロイ（Lolipop!／CGI）

### 5.1 前提条件（サーバー側）
- Python 3.7 実行環境（`/usr/local/bin/python3.7`）
- CGI 実行が有効
- サーバー側の Python モジュールはバージョン固定（`docs/requirements_server.txt` を参照）

### 5.2 配置手順（SFTP/SSH）
1. サーバーへ接続（SSH または SFTP）
2. CGI 実行ディレクトリへアップロード
    - 必須: [index.cgi](index.cgi), [wsgi_app.py](wsgi_app.py), [config.py](config.py)
    - ディレクトリ: [app/](app), [data/](data)
3. 実行権限の付与（Lolipop 推奨パーミッション）
    - CGI 実行ファイル: `index.cgi` → `700`
    - ディレクトリ: `public_html/` や `study/` など → `705`
    - Python スクリプト（例: [wsgi_app.py](wsgi_app.py), [config.py](config.py)）→ `604`
    - HTML/CSS/JS/画像ファイル → `604`
    - CGI のデータファイル（書込み含む）→ `600`
    - `.htaccess` → `604`
4. 環境変数の設定（コントロールパネル等）
    - `SECRET_KEY`（必須）
    - `LOG_LEVEL`（任意）

#### 5.2.1 サーバーの配置構成（例）
以下は `public_html/study/` に設置する例です。ルート直下に `index.cgi` と `wsgi_app.py` を置き、テンプレート／静的ファイルは `app/` 配下にまとめます。

```
public_html/
└─ study/
    ├─ index.cgi                # CGI エントリ（700）
    ├─ wsgi_app.py              # WSGI アプリ
    ├─ config.py                # 設定（os.getenv のみ）
    ├─ app/
    │  ├─ __init__.py
    │  ├─ portal/
    │  │  ├─ __init__.py
    │  │  ├─ routes.py
    │  │  └─ logic.py
    │  ├─ kuku/
    │  │  ├─ __init__.py
    │  │  ├─ routes.py
    │  │  └─ models.py
    │  ├─ shisoku/
    │  │  ├─ __init__.py
    │  │  └─ routes.py
    │  ├─ common/
    │  │  ├─ __init__.py
    │  │  ├─ db.py
    │  │  └─ utils.py
    │  ├─ static/
    │  │  ├─ css/
    │  │  ├─ js/
    │  │  ├─ images/
    │  │  ├─ manifest.json
    │  │  └─ sw.js
    │  └─ templates/
    │     ├─ base.html
    │     ├─ portal/index.html
    │     ├─ kuku/index.html
    │     └─ shisoku/index.html
    ├─ data/                    # SQLite DB／初期化用
    └─ docs/                    # ドキュメント（不要なら除外可）
```

注: 実際の Lolipop! の公開ディレクトリ名はプランや設定により異なる場合があります（例: `web/`, `public_html/`）。ご利用環境のドキュメントルートを確認して適宜読み替えてください。

#### 5.2.2 パーミッションと改行コードの注意
- CGI 実行ファイル（`.cgi`）は `700` に設定してください。
- ディレクトリは `705`、その他のテキストファイル（`.py`, `.html`, `.css`, `.js`）は通常 `604` を推奨します。
- CGI のデータファイルは `600` を推奨します。
- `.htaccess` は `604` を推奨します。
- Windows からアップロードする場合、改行コードは LF（Unix）を推奨します（サーバー側でのスクリプト解釈の互換性のため）。

### 5.3 動作確認（CGI）
- ブラウザでサイトルートにアクセス（ポータル画面）
- 九九: `/kuku/`、四則演算: `/shisoku/` が表示されること

### 5.4 セキュリティ／ドメイン
- SSL（HTTPS）を有効化
- ドメイン設定を完了（DNS／ネームサーバー）

---

## 6. デプロイ後の確認

### 6.1 アプリ表示確認
- ポータル: `https://your-domain.jp/` が表示される
- 九九: `https://your-domain.jp/kuku/`
- 四則演算: `https://your-domain.jp/shisoku/`

### 6.2 静的ファイル／PWA
- 画像・CSS・JS の読み込みエラーがないこと
- Manifest・Service Worker が登録されること

### 6.3 ログ／エラー
- [wsgi_app.py](wsgi_app.py) により、致命的エラーは `error.log` に追記されます（設置ディレクトリ直下）。

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

デプロイ前後の確認：

- [ ] Python 3.7（`/usr/local/bin/python3.7`）が利用可能
- [ ] `index.cgi` の実行権限が `700`
- [ ] ディレクトリ権限が `705`
- [ ] 必須ファイルの配置（[index.cgi](index.cgi), [wsgi_app.py](wsgi_app.py), [config.py](config.py), [app/](app), [data/](data)）
- [ ] サーバー側モジュールの互換性（[docs/requirements_server.txt](docs/requirements_server.txt)）
- [ ] 環境変数（`SECRET_KEY` など）が設定済み
- [ ] SQLite の書込み権限（[data/](data)）
- [ ] ポータル／各アプリの表示確認（`/`, `/kuku`, `/shisoku`）
- [ ] 静的ファイル・PWA（Manifest／Service Worker）が正常
- [ ] 重大エラー時の `error.log` 出力確認
