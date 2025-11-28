# Copilot Instructions

このファイルは、GitHub Copilot がこのプロジェクトで効率的に動作するためのガイドラインを記載しています。

## プロジェクト概要

**九九練習アプリ** - 小学生（1～3年生）向けのPWA対応Webアプリケーション

- **言語**: Python (Flask 2.2.5), JavaScript (Vanilla), HTML5, CSS3
- **ホスティング**: Lolipop! レンタルサーバー（ハイスピードプラン、CGI環境）
- **データベース**: SQLite 3
- **フロントエンド**: Vanilla JavaScript + Service Worker + Web App Manifest

## アーキテクチャ

### バックエンド構成
- **エントリーポイント**: `wsgi_app.py` (CGI互換、WSGI用)
- **設定**: `config.py` (dotenv 不使用、os.getenv() のみ)
- **フレームワーク**: Flask + Blueprint ベース
  - `app/portal/` - ポータル画面（アプリ一覧）
  - `app/kuku/` - 九九練習アプリ
  - `app/common/` - 共通モジュール
- **ディレクトリ構造**: モジュール化されたBlueprint設計

### フロントエンド構成
- **テンプレート**: Jinja2 + HTML5
- **スタイル**: CSS3（レスポンシブデザイン対応）
- **JavaScript**: Vanilla JS
  - `app/static/js/main.js` - メイン処理、テンキー入力管理
  - `app/static/js/quizLogic.js` - 問題生成、シャッフル
  - `app/static/js/scorer.js` - 採点、正答率計算
  - その他ユーティリティ関数
- **PWA**: Service Worker + Web App Manifest

## 重要な設計原則

### 1. クライアント側の処理最大化
- **問題生成**: クライアント側で実施（サーバーAPI呼び出しなし）
- **採点**: クライアント側で実施（サーバーAPI呼び出しなし）
- **正答率計算**: クライアント側で実施
- **画面遷移**: 全てクライアント側で管理
- **サーバー呼び出し**: セッション作成と結果保存のみ

### 2. CGI環境対応
- `wsgi_app.py` では以下を設定：
  ```python
  app.config['SCRIPT_NAME'] = ''
  app.config['APPLICATION_ROOT'] = '/'
  ```
- CGIHandler 経由で動作（index.cgi → wsgi_app.py）

### 3. 設定管理（本番環境向け）
- `.env` ファイルは使用しない
- `os.getenv()` で環境変数を取得（デフォルト値付き）
- `python-dotenv` パッケージは不要

## ファイル修正時のポイント

### HTML/テンプレート修正
- **答え入力フィールド**: 削除済み（テンキー入力で実装）
- **表示要素**: `<span id="quiz-answer">?</span>` に入力値をリアルタイム表示
- **「完成！」メッセージ**: 削除済み（結果画面には含まない）

### JavaScript 修正
- **currentAnswer**: 内部状態変数として管理（DOM要素なし）
  ```javascript
  this.currentAnswer = '';  // 初期化
  ```
- **addNumberToInput(number)**: `this.currentAnswer` に追加
- **clearNumberInput()**: `this.currentAnswer` をリセット
- **submitAnswer()**: `this.currentAnswer` から値を取得して採点

### Python/Flask 修正
- `config.py`: `from dotenv import load_dotenv` の削除
- `wsgi_app.py`: CGI設定（SCRIPT_NAME, APPLICATION_ROOT）
- **データベース**: SQLite のみ（MySQL/MySQLConnector 不要）

## 日本語テキスト

### 段選択画面
- ❌ 「どの段を練習しますか？」（旧）
- ✅ 「かける数を選択してください」（現在）

### 出題画面
- **入力方式**: テンキー（0～9とクリアボタン）
- **表示**: 問題文「a × b = ?」の「?」部分に入力値をリアルタイム表示

### 結果画面
- ❌ 「完成！」メッセージ（旧）
- ✅ 「お疲れ様でした！」+正答率表示（現在）

## ドキュメント参照

プロジェクトのドキュメントは `docs/` ディレクトリに格納：
- `00_specification.md` - 統合仕様書
- `01_requirements.md` - 要件定義
- `02_screen_design.md` - 画面設計
- `03_functional_requirements.md` - 機能仕様
- `04_technical_design.md` - フロントエンド技術設計
- `05_user_flow.md` - ユースケース・画面遷移
- `06_server_architecture.md` - サーバーアーキテクチャ
- `07_deployment_guide.md` - デプロイ手順書

## コミットガイドライン
- 修正作業ごとに適宜コミットやプッシュは実施しない
- コミットやプッシュなどのGitに関する操作は、ユーザーから指示があったときのみ行う
- **コミットメッセージ**: 日本語で記載
- **形式**: `feat/fix/docs: 変更内容の説明`
- **例**:
  ```
  feat: テンキー入力機能を追加
  fix: クイズ画面の「完成！」メッセージを削除
  docs: ドキュメント内容をプロジェクトの実装に合わせて更新
  ```

## よくある質問

### Q. なぜ python-dotenv を削除したのか？
A. Lolipop! サーバーに python-dotenv がインストールされていないため。本番環境では `os.getenv()` でシステム環境変数から設定を読み込みます。

### Q. なぜクライアント側で採点するのか？
A. 30人の同時アクセスを想定し、サーバー負荷を最小化するため。クライアント側で完結する処理をサーバーに依頼する必要がありません。

### Q. CGI 環境で Flask を動かすには？
A. `index.cgi` が `wsgiref.handlers.CGIHandler` で WSGI アプリケーション (`wsgi_app.py`) をラップします。`SCRIPT_NAME` と `APPLICATION_ROOT` の設定が重要です。

---

**最終更新**: 2025年11月28日
