# フロントエンド技術設計書

## 1. 技術スタック

### 1.1 フロントエンド使用技術

| 層 | 技術 | バージョン目安 | 用途 |
|----|------|-------------|------|
| **マークアップ** | HTML5 | 標準 | ページ構造 |
| **スタイル** | CSS3 | 標準 | レスポンシブデザイン |
| **スクリプト** | JavaScript | ES6以上 | インタラクション |
| **フレームワーク** | Vanilla JS | 推奨 | 外部フレームワーク不要 |
| **HTTP通信** | Fetch API | ブラウザ標準 | サーバー連携 |
| **PWA** | Service Worker + Manifest | 標準 | オフライン対応・ホーム画面追加 |

### 1.2 バックエンド連携

| 層 | 技術 | バージョン | 機能 |
|----|------|----------|------|
| **フレームワーク** | Flask | 2.2.5 | ルーティング、テンプレート |
| **言語** | Python | 3.7 | サーバーロジック |
| **データベース** | SQLite | 3（内蔵） | セッション・履歴保存 |
| **API形式** | REST + JSON | 標準 | クライアント通信 |
| **ホスティング** | Lolipop! ハイスピード | Nginx + LiteSpeed | デプロイ先

### 1.3 推奨構成（初期版）
**フロントエンド: Vanilla JS + HTML5 + CSS3 + PWA**
- 外部JavaScriptフレームワーク不要
- PWA対応で、スマートフォンのホーム画面にインストール可能
- Service Workerによるオフライン対応
- メンテナンス性が高い

**バックエンド: Flask + SQLite**
- セッション管理、データ永続化に対応
- 将来のアプリ拡張に対応可能（Blueprint設計）

### 1.4 設計原則：サーバー負荷最小化
**想定利用シーン**: 小学生30名が同一学級で同時利用（授業環境）

#### クライアント側で実装すべき処理
✅ **クライアント側で実施**:
1. **問題生成**: JavaScript で全問題を一括生成
2. **問題シャッフル**: Fisher-Yates アルゴリズムでランダム化
3. **採点**: ユーザー入力と正答の比較判定
4. **正答率計算**: クライアント側で集計
5. **画面遷移**: 全画面遷移・状態管理をクライアント側で管理

❌ **サーバー呼び出しは最小限**:
- 初回セッション作成時（1回/ユーザー）
- 最終結果保存時（1回/セッション）

#### API削減効果
| 処理 | 従来（サーバー処理） | 改善後（クライアント処理） | 削減率 |
|-----|-----------------|---------------------|--------|
| 問題生成 | 30回のAPI呼び出し | 0回 | 100% |
| 採点（9問） | 30名 × 9問 = 270回 | 0回 | 100% |
| 結果計算 | 30回のAPI呼び出し | 0回 | 100% |
| **合計API削減** | 300+API呼び出し | 60API呼び出し（セッション作成30回+結果保存30回）| **80%削減** |

#### ネットワーク帯域削減
- 30名同時アクセス時、従来の300+回の通信が60回に削減
- ピーク時のサーバー負荷を1/5以下に軽減
- モバイル環境での通信遅延を大幅削減

---

## 2. プロジェクト構造

### 2.1 ファイルツリー
```
kuku/
├── templates/
│   └── kuku/
│       ├── index.html           # メインHTMLファイル
│       └── base.html            # ベーステンプレート
├── static/
│   ├── css/
│   │   ├── style.css            # 全体スタイル（レスポンシブ対応）
│   │   ├── responsive.css       # メディアクエリ集約
│   │   └── pwa.css              # PWA用スタイル
│   ├── js/
│   │   ├── main.js              # エントリーポイント
│   │   ├── app.js               # アプリケーションメインロジック
│   │   ├── pwa.js               # Service Worker登録
│   │   ├── screens/
│   │   │   ├── startScreen.js
│   │   │   ├── levelScreen.js
│   │   │   ├── modeScreen.js
│   │   │   ├── quizScreen.js
│   │   │   └── resultScreen.js
│   │   ├── logic/
│   │   │   ├── quizLogic.js     # 問題生成・出題ロジック
│   │   │   ├── scorer.js         # 採点ロジック
│   │   │   └── stateManager.js   # 状態管理
│   │   └── utils/
│   │       ├── localStorage.js   # ローカルストレージ管理
│   │       └── helpers.js        # ユーティリティ関数
│   ├── images/
│   │   ├── icon-192x192.png     # PWAアイコン（192px）
│   │   ├── icon-512x512.png     # PWAアイコン（512px）
│   │   ├── maskable-icon-192x192.png  # マスク可能アイコン
│   │   ├── screenshot-1.png     # PWAスクリーンショット（縦）
│   │   └── screenshot-2.png     # PWAスクリーンショット（横）
│   └── service-worker.js        # Service Worker実装
├── manifest.json                # Web App Manifest
└── routes.py                    # Flaskルート
```

### 2.2 各ファイルの責務

| ファイル | 責務 |
|---------|------|
| **index.html** | HTMLテンプレート、DOM構造の定義 |
| **base.html** | Flaskベーステンプレート、manifest.json・PWAメタタグ含む |
| **style.css** | 全体のスタイル、レスポンシブデザイン |
| **responsive.css** | メディアクエリ（モバイル/タブレット/デスクトップ） |
| **pwa.css** | PWA固有のスタイル（standalone表示時など） |
| **main.js** | アプリケーション初期化、Service Worker登録 |
| **app.js** | 画面遷移管理、全体フロー制御 |
| **pwa.js** | Service Worker登録、更新確認機能 |
| **startScreen.js** | スタート画面のロジック |
| **levelScreen.js** | 段選択画面のロジック、バリデーション |
| **modeScreen.js** | 出題方式選択画面のロジック |
| **quizScreen.js** | 出題画面のロジック、入力処理 |
| **resultScreen.js** | 結果表示画面のロジック |
| **quizLogic.js** | 問題生成、シャッフル処理（**クライアント側で全処理実施**） |
| **scorer.js** | 採点、正答率計算（**クライアント側で全採点処理実施**） |
| **stateManager.js** | アプリケーション状態の一元管理（**クライアント側でメモリ管理**） |
| **localStorage.js** | ブラウザストレージ操作（セッション保存、オフライン対応） |
| **helpers.js** | 共通の補助関数（DOM操作など） |
| **service-worker.js** | キャッシング戦略、オフライン対応 |
| **manifest.json** | Web App Manifest設定 |

**重要**: 問題生成・採点・正答率計算は全てクライアント側で実施し、サーバーへのAPI呼び出しを最小化

---

## 3. データ構造

### 3.1 アプリケーション状態（State）
```javascript
{
  currentScreen: "start" | "level" | "mode" | "quiz" | "result",
  selectedLevels: [2, 3, 5],              // 選択された段
  quizMode: "sequential" | "random",      // 出題方式
  quizList: [
    {
      id: 1,
      multiplicand: 2,
      multiplier: 1,
      correctAnswer: 2,
      userAnswer: null,
      isCorrect: null
    },
    ...
  ],
  currentQuizIndex: 0,                    // 現在の問題インデックス
  correctCount: 0,                        // 正答数
  totalCount: 0                           // 総問数
}
```

### 3.2 問題オブジェクト
```javascript
{
  id: number,                     // ユニークID
  multiplicand: number (1-9),     // 掛けられる数
  multiplier: number (1-9),       // 掛ける数
  correctAnswer: number,          // 正答（multiplicand × multiplier）
  userAnswer: number | null,      // ユーザーの回答
  isCorrect: boolean | null       // 正誤判定
}
```

### 3.3 結果オブジェクト
```javascript
{
  correctCount: number,           // 正答数
  totalCount: number,             // 総問数
  correctRate: number,            // 正答率（%）
  selectedLevels: [2, 3, 5],      // 学習した段
  quizMode: "sequential" | "random"
}
```

---

## 4. 主要ロジック（クライアント側で全処理実施）

### 4.1 問題生成ロジック（クライアント側で全処理実施）

**実施場所**: クライアント（JavaScript）
**処理タイミング**: セッション開始時に、選択された段から全問題を一括生成
**サーバー呼び出し**: なし

#### 順番出題の場合
```javascript
function generateSequentialQuizzes(levels) {
  const quizzes = [];
  let id = 1;
  
  for (const level of levels.sort((a, b) => a - b)) {
    for (let multiplier = 1; multiplier <= 9; multiplier++) {
      quizzes.push({
        id: id++,
        multiplicand: level,
        multiplier: multiplier,
        correctAnswer: level * multiplier,
        userAnswer: null,
        isCorrect: null
      });
    }
  }
  
  return quizzes;
}
```

#### ランダム出題の場合
```javascript
function generateRandomQuizzes(levels) {
  const quizzes = generateSequentialQuizzes(levels);
  return shuffleArray(quizzes);
}

// Fisher-Yatesシャッフル（クライアント側で実行）
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### 4.2 採点ロジック（クライアント側で全処理実施）

**実施場所**: クライアント（JavaScript）
**処理タイミング**: ユーザーが「次へ」をクリック時、または全問題終了時
**サーバー呼び出し**: なし

```javascript
function scoreQuiz(quizList) {
  let correctCount = 0;
  
  for (const quiz of quizList) {
    if (quiz.userAnswer === quiz.correctAnswer) {
      quiz.isCorrect = true;
      correctCount++;
    } else {
      quiz.isCorrect = false;
    }
  }
  
  return correctCount;
}
```
  let id = 1;
  
  for (const level of levels.sort((a, b) => a - b)) {
    for (let multiplier = 1; multiplier <= 9; multiplier++) {
      quizzes.push({
        id: id++,
        multiplicand: level,
        multiplier: multiplier,
        correctAnswer: level * multiplier,
        userAnswer: null,
        isCorrect: null
      });
    }
  }
  
  return quizzes;
}
```

#### ランダム出題の場合
```javascript
function generateRandomQuizzes(levels) {
  const quizzes = generateSequentialQuizzes(levels);
  return shuffleArray(quizzes);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### 4.2 採点ロジック
```javascript
function scoreQuiz(quizList) {
  let correctCount = 0;
  
  for (const quiz of quizList) {
    if (quiz.userAnswer === quiz.correctAnswer) {
      quiz.isCorrect = true;
      correctCount++;
    } else {
      quiz.isCorrect = false;
    }
  }
  
  return correctCount;
}
```

### 4.3 正答率計算ロジック
```javascript
function calculateCorrectRate(correctCount, totalCount) {
  if (totalCount === 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}
```

### 4.4 状態管理（StageManager）
```javascript
class StateManager {
  constructor() {
    this.state = this.getInitialState();
  }
  
  getInitialState() {
    return {
      currentScreen: "start",
      selectedLevels: [],
      quizMode: null,
      quizList: [],
      currentQuizIndex: 0,
      correctCount: 0,
      totalCount: 0
    };
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
  }
  
  getState() {
    return this.state;
  }
  
  resetState() {
    this.state = this.getInitialState();
  }
}
```

---

## 5. 画面遷移フロー（状態遷移図）

```
START STATE: currentScreen = "start"
  ↓ (ユーザー: さっそく始める！)
LEVEL STATE: currentScreen = "level"
  ↓ (ユーザー: OK / selectedLevels をセット)
MODE STATE: currentScreen = "mode"
  ↓ (ユーザー: OK / quizMode をセット、問題生成)
QUIZ STATE: currentScreen = "quiz"
  ↓ (ユーザー: 回答入力)
  → 正誤判定 → currentQuizIndex++
  → currentQuizIndex === quizList.length ? RESULT : QUIZ続行
RESULT STATE: currentScreen = "result"
  ↓
  ├─ (ユーザー: 最初に戻る) → resetState() → START
  └─ (ユーザー: もう一度) → quizList をリセット → QUIZ
```

---

## 6. イベント・リスナー設計

### 6.1 主要なイベント

| イベント | トリガー | ハンドラー処理 |
|---------|---------|-------------|
| levelCheckChange | チェックボックス変更 | 選択段を state に反映、OKボタン有効/無効化 |
| modeRadioChange | ラジオボタン変更 | 出題方式を state に反映 |
| answerInputChange | 入力フィールド変更 | 数字フィルタリング、次へボタン有効/無効化 |
| nextButtonClick | 次へボタン | 回答を記録、採点、画面遷移 |
| backButtonClick | 戻るボタン | 確認ダイアログ表示、画面遷移 |
| retryButtonClick | もう一度ボタン | quizList リセット、QUIZ 状態へ |
| resetButtonClick | リセットボタン | 全選択を解除 |

---

## 7. ブラウザ API

### 7.1 使用予定API

| API | 用途 |
|----|------|
| **localStorage** | セッションデータの永続化（オプション） |
| **DOM API** | 画面操作、イベントリスナー登録 |
| **Math.random()** | シャッフル時のランダム生成 |

### 7.2 非サポート機能
- Service Worker（オフライン対応は初期版では不要）
- IndexedDB（ローカルストレージで十分）
- Web Audio API（音声は初期版では不要）

---

## 8. パフォーマンス考慮

### 8.1 最適化方針
- **DOM操作の最小化**: バッチ更新を心がける
- **イベントデリゲーション**: 多数の要素がある場合に使用
- **状態の集約**: StateManager で一元管理
- **リフロー・リペイント削減**: CSS アニメーション活用

### 8.2 メモリ管理
- 問題リストは 81問以下（9段全選択時）なので、メモリ負荷は無視できる
- 画面遷移時に不要な DOM を削除（オプション）

---

## 9. セキュリティ考慮

### 9.1 入力検証
- 数値入力のみ許可（JavaScript で制限）
- HTML Escape は不要（ユーザー入力を DOM 内に表示しない）

### 9.2 XSS 対策
- `innerHTML` ではなく `textContent` を使用
- ユーザー入力を直接 DOM に挿入しない

### 9.3 CSRF対策
- バックエンド Flask API との通信時に CSRF トークン検証を実装
- Fetch API で `X-CSRF-Token` ヘッダーを送信

### 9.4 API通信のセキュリティ
```javascript
// Fetch API でバックエンド API を呼び出し
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken()  // CSRF トークン
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`/kuku${endpoint}`, options);
  return response.json();
}
```

---

## 10. バックエンドAPI との連携

### 10.1 API エンドポイント一覧

| メソッド | エンドポイント | 用途 | リクエスト | レスポンス |
|---------|-------------|------|-----------|-----------|
| GET | `/kuku/` | アプリ初期化 | - | `{ status: 'ready' }` |
| POST | `/kuku/api/quiz` | 出題リスト取得 | `{ levels: [...], mode: '...' }` | `{ quiz_list: [...], session_id: '...', total_count: n }` |
| POST | `/kuku/api/submit` | 回答送信・採点 | `{ session_id: '...', quiz_id: n, user_answer: n }` | `{ quiz_id: n, is_correct: bool, correct_answer: n }` |
| GET | `/kuku/api/result/<session_id>` | 結果表示 | - | `{ correct_count: n, total_count: n, correct_rate: n }` |

### 10.2 フロントエンドでのAPI呼び出し例

```javascript
// 段選択後、出題リストを取得
async function fetchQuizzes(selectedLevels, mode) {
  try {
    const response = await fetch('/kuku/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        levels: selectedLevels,
        mode: mode
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        sessionId: data.session_id,
        quizzes: data.quiz_list,
        totalCount: data.total_count
      };
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

// 回答を送信
async function submitAnswer(sessionId, quizId, userAnswer) {
  try {
    const response = await fetch('/kuku/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        quiz_id: quizId,
        user_answer: userAnswer
      })
    });
    
    const data = await response.json();
    return data.is_correct;
  } catch (error) {
    console.error('API Error:', error);
    return false;
  }
}

// 結果を取得
async function fetchResult(sessionId) {
  try {
    const response = await fetch(`/kuku/api/result/${sessionId}`);
    const data = await response.json();
    return {
      correctCount: data.correct_count,
      totalCount: data.total_count,
      correctRate: data.correct_rate
    };
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}
```

### 10.3 エラーハンドリング

```javascript
// API エラー時の対応
function handleApiError(error) {
  console.error('API Error:', error);
  
  if (error.status === 400) {
    alert('入力値が無効です');
  } else if (error.status === 404) {
    alert('セッションが見つかりません');
  } else if (error.status === 500) {
    alert('サーバーエラーが発生しました');
  } else {
    alert('通信エラーが発生しました');
  }
}
```

---

## 11. テスト戦略

### 11.1 ユニットテスト対象

| テスト対象 | テストフレームワーク |
|-----------|-------------------|
| quizLogic.js（問題生成） | Jest または Vitest |
| scorer.js（採点） | Jest または Vitest |
| stateManager.js（状態管理） | Jest または Vitest |

### 11.2 統合テスト
- 画面遷移のシーケンス
- 状態の正確性
- バックエンド API との連携

### 11.3 E2E テスト（オプション）
- Cypress または Playwright
- ユーザーフローの全体検証
- バックエンド API 結果の確認

### 11.4 テスト例（Jest）
```javascript
// quizLogic.test.js
describe('QuizLogic', () => {
  test('問題リストが正しく生成される', () => {
    const logic = new QuizLogic([2], 'sequential');
    const quizzes = logic.generateQuizzes();
    
    expect(quizzes.length).toBe(9);
    expect(quizzes[0].multiplicand).toBe(2);
    expect(quizzes[0].multiplier).toBe(1);
    expect(quizzes[0].correctAnswer).toBe(2);
  });
  
  test('ランダムモードでシャッフルされる', () => {
    const logic = new QuizLogic([2, 3], 'random');
    const quizzes = logic.generateQuizzes();
    
    // 順番出題と同じ問題が含まれているか確認
    expect(quizzes.length).toBe(18);
  });
});
```

---

## 12. ブラウザ互換性

### 12.1 サポート対象
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 12.2 フォールバック
- ES6 を使用するため、古いブラウザはサポート外
- ポリフィルは不要

---

## 13. デプロイ・ファイル構成

### 13.1 本番環境でのファイル配置

フロントエンドファイルは Flask のテンプレート・静的ファイルディレクトリに配置：

```
app/
└── kuku/
    ├── templates/
    │   └── kuku/
    │       └── index.html          # メイン画面
    ├── static/
    │   ├── css/
    │   │   └── style.css
    │   └── js/
    │       ├── main.js
    │       ├── app.js
    │       ├── screens/
    │       ├── logic/
    │       └── utils/
    └── routes.py                   # Flask ルート定義
```

### 13.2 Flask での静的ファイル配信

```python
# kuku/routes.py
from flask import render_template

@kuku_bp.route('/', methods=['GET'])
def index():
    """フロントエンド index.html を返す"""
    return render_template('kuku/index.html')
```

### 13.3 本番環境への推奨チェックリスト
- [ ] JavaScript ファイル minify
- [ ] CSS ファイル minify
- [ ] 不要なログ出力削除
- [ ] API エラーハンドリング確認
- [ ] ブラウザ互換性テスト
- [ ] レスポンシブデザインテスト（モバイル・タブレット・デスクトップ）
- [ ] ネットワーク遅延時のテスト
- [ ] PWA インストール可能性検証
- [ ] Service Worker キャッシング動作確認

---

## 14. PWA実装仕様

### 14.1 Service Worker

#### キャッシング戦略
```javascript
// service-worker.js
const CACHE_NAME = 'kuku-v1';
const urlsToCache = [
  '/kuku/',
  '/kuku/static/css/style.css',
  '/kuku/static/js/main.js',
  '/kuku/static/js/app.js',
  '/kuku/static/images/icon-192x192.png',
  '/kuku/manifest.json'
];

// インストール時：静的アセット をキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// フェッチ時：キャッシュファースト（静的）またはネットワークファースト（API）
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API リクエスト：ネットワークファースト
  if (url.pathname.startsWith('/kuku/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 正常な レスポンスをキャッシュに保存
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // オフラインまたはネットワークエラー時：キャッシュから取得
          return caches.match(request);
        })
    );
  } else {
    // 静的ファイル：キャッシュファースト
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
  }
});

// アクティベート時：古い キャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
```

### 14.2 Service Worker登録

```javascript
// pwa.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/kuku/static/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
        
        // 更新確認
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // 更新があることをユーザーに通知
              console.log('New version available!');
              // オプション：ユーザーに更新を促すUI表示
            }
          });
        });
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// インストールプロンプト処理
let deferredPrompt;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  
  // インストールボタンを表示
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.style.display = 'block';
    installBtn.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
    });
  }
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
});
```

### 14.3 Web App Manifest

```json
{
  "name": "九九練習アプリ",
  "short_name": "九九練習",
  "description": "小学生向けの九九（掛け算）練習アプリ",
  "start_url": "/kuku/",
  "scope": "/kuku/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#007bff",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/kuku/static/images/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/kuku/static/images/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/kuku/static/images/maskable-icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["education"],
  "screenshots": [
    {
      "src": "/kuku/static/images/screenshot-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/kuku/static/images/screenshot-2.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

### 14.4 HTMLメタタグ設定

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#007bff">
  <meta name="description" content="小学生向けの九九（掛け算）練習アプリ">
  
  <!-- Web App Manifest -->
  <link rel="manifest" href="/kuku/manifest.json">
  
  <!-- Apple固有メタタグ -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="九九練習">
  <link rel="apple-touch-icon" href="/kuku/static/images/icon-192x192.png">
  
  <title>九九練習アプリ</title>
  <link rel="stylesheet" href="/kuku/static/css/style.css">
</head>
<body>
  <div id="app"></div>
  <script src="/kuku/static/js/pwa.js"></script>
  <script src="/kuku/static/js/main.js"></script>
</body>
</html>
```

### 14.5 オフライン対応の制限事項

現在の実装では以下のケースでオフラインが有効に機能します：

✅ **オフライン対応可能**:
- 静的ページ表示（HTML、CSS、JavaScript）
- 過去のセッション結果表示（キャッシュされたデータ）
- 基本UI操作（ボタンクリック等）

❌ **オフライン未対応**:
- 新規セッション作成（バックエンド API必須）
- リアルタイム採点（API呼び出し必須）
- データベースへの保存

将来的には IndexedDB を導入することで、オフライン中のデータ同期機能を実装可能。

### 14.6 レスポンシブメディアクエリ

```css
/* responsive.css */

/* モバイル（〜599px） */
@media (max-width: 599px) {
  body {
    font-size: 14px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  button {
    width: 100%;
    height: 50px;
    font-size: 16px;
  }
  
  .quiz-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .input-field {
    width: 100%;
    font-size: 18px;
    padding: 10px;
  }
}

/* タブレット（600px〜899px） */
@media (min-width: 600px) and (max-width: 899px) {
  body {
    font-size: 16px;
  }
  
  h1 {
    font-size: 28px;
  }
  
  button {
    width: 45%;
    height: 50px;
    font-size: 16px;
  }
  
  .quiz-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .input-field {
    width: 200px;
    font-size: 18px;
    padding: 10px;
  }
}

/* デスクトップ（900px以上） */
@media (min-width: 900px) {
  body {
    font-size: 16px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 36px;
  }
  
  button {
    width: 40%;
    height: 50px;
    font-size: 16px;
  }
  
  .quiz-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .input-field {
    width: 250px;
    font-size: 18px;
    padding: 12px;
  }
}

/* タッチ操作対応 */
@media (pointer: coarse) {
  button, input, a {
    min-width: 44px;
    min-height: 44px;
  }
}

/* ダークモード対応（オプション） */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1a1a1a;
    color: #ffffff;
  }
  
  button {
    background-color: #0056b3;
    color: #ffffff;
  }
}

/* 高コントラストモード対応 */
@media (prefers-contrast: more) {
  body {
    background-color: #ffffff;
    color: #000000;
  }
  
  button {
    border: 2px solid #000000;
  }
}
```
