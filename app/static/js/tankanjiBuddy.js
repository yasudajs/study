/**
 * 単漢字練習 - メインロジック
 */

class TankanjiBuddy {
  constructor() {
    // 設定
    this.selectedGrade = null;
    this.selectedOrder = null;
    this.selectedType = 'read';
    // デバッグ
    this._debugPrefix = '[DEBUG][tankanji]';

    // クイズ状態
    this.quizList = [];
    this.currentQuestionIndex = 0;
    this.sessionHistory = [];

    // ローカルストレージのキープレフィックス（練習種別はread固定）
    this.progressKey = (grade) => `tankanji_progress_${grade}_read`;
    this.historyKey = 'tankanji_history';

    // キャッシュ
    this.allKanjiData = null;

    this.init();
  }

  async init() {
    // DOMの初期化を待つ
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupDOM());
    } else {
      this.setupDOM();
    }
  }

  setupDOM() {
    // 設定画面のイベントリスナー
    document.getElementById('gradeSelect').addEventListener('change', (e) =>
      this.onGradeSelect(e)
    );

    // 順序選択ボタン
    document.getElementById('strokeOrderBtn').addEventListener('click', (e) =>
      this.onOrderSelect(e)
    );
    document.getElementById('randomOrderBtn').addEventListener('click', (e) =>
      this.onOrderSelect(e)
    );

    // 開始ボタン
    document.getElementById('startBtn').addEventListener('click', () =>
      this.startQuiz()
    );

    // 読み練習
    document.getElementById('showAnswerBtn').addEventListener('click', () =>
      this.showAnswer()
    );
    document.getElementById('nextQuizBtn').addEventListener('click', () =>
      this.nextQuestion()
    );

    // 完了画面
    document.getElementById('restartBtn').addEventListener('click', () =>
      this.startQuiz()
    );
    document.getElementById('goToHistoryBtn').addEventListener('click', () => {
      // rirekiアプリのカレンダーに遷移
      window.location.href = '/rireki/';
    });
    document.getElementById('backToSettingFromCompletionBtn').addEventListener('click', () =>
      this.backToSetting() // 画面移動では進捗を維持
    );

    // 履歴画面
    document.getElementById('backToSettingFromHistoryBtn').addEventListener('click', () =>
      this.backToSetting() // 画面移動では進捗を維持
    );

    // 初期画面表示
    this.showScreen('settingScreen');
  }

  onGradeSelect(e) {
    this.selectedGrade = e.target.value ? parseInt(e.target.value) : null;

    if (this.selectedGrade) {
      // read固定。学年選択後に順序選択を表示
      this.selectedType = 'read';

      // リセット
      this.selectedOrder = null;
      document.getElementById('orderSection').style.display = 'block';
      document.getElementById('startSection').style.display = 'none';

      // 順序ボタンのリセット
      document.querySelectorAll('#orderSection .option-btn').forEach((btn) => {
        btn.classList.remove('selected');
      });
    } else {
      document.getElementById('orderSection').style.display = 'none';
      document.getElementById('startSection').style.display = 'none';
    }
  }

  onOrderSelect(e) {
    this.selectedOrder = e.target.dataset.order;
    e.target.classList.add('selected');
    // 他のボタンから選択を外す
    document.querySelectorAll('#orderSection .option-btn').forEach((btn) => {
      if (btn !== e.target) {
        btn.classList.remove('selected');
      }
    });

    document.getElementById('startSection').style.display = 'flex';
  }

  async startQuiz() {
    console.log(`${this._debugPrefix} startQuiz: grade=${this.selectedGrade}, type=read, order=${this.selectedOrder}`);

    if (!this.selectedGrade || !this.selectedOrder) {
      alert('学年と出題の順序を選択してください');
      return;
    }
    // 漢字データの取得
    if (!this.allKanjiData) {
      try {
        const response = await fetch('/tankanji/api/kanji-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.status === 'error') {
          throw new Error(result.message);
        }
        this.allKanjiData = result.data;
        console.log(`${this._debugPrefix} kanji dataset loaded: total=${this.allKanjiData.length}`);
      } catch (error) {
        console.error('漢字データ取得エラー:', error);
        alert('漢字データが読み込めません: ' + error.message);
        return;
      }
    }

    // 学年別の漢字データを取得
    const gradeKanjis = this.allKanjiData.filter(
      (item) => item.学年 === this.selectedGrade.toString()
    );
    console.log(`${this._debugPrefix} gradeKanjis count=${gradeKanjis.length}`);

    if (gradeKanjis.length === 0) {
      alert('該当する漢字がありません');
      return;
    }

    // 出題済みIDを取得
    const progressKey = this.progressKey(this.selectedGrade);
    const usedIds = JSON.parse(localStorage.getItem(progressKey) || '[]');
    console.log(`${this._debugPrefix} progressKey=${progressKey}`);
    console.log(`${this._debugPrefix} usedIds length=${usedIds.length} sample=`, usedIds.slice(0, 20));
    if (usedIds.length > 0) {
      console.log(`${this._debugPrefix} usedIds type sample=${typeof usedIds[0]}`);
    }

    // 出題対象の漢字を抽出
    let availableKanjis = gradeKanjis.filter(
      (item) => !usedIds.includes(item['ID'])
    );
    console.log(`${this._debugPrefix} availableKanjis before reset count=${availableKanjis.length}`);

    // 全て出題済みの場合、リセット
    if (availableKanjis.length === 0) {
      localStorage.removeItem(progressKey);
      availableKanjis = gradeKanjis;
      usedIds.length = 0;
      console.log(`${this._debugPrefix} all used for key=${progressKey}, progress reset. availableKanjis count=${availableKanjis.length}`);
    }

    // 順序でソート
    if (this.selectedOrder === 'stroke') {
      availableKanjis.sort((a, b) => parseInt(a.画数) - parseInt(b.画数));
      console.log(`${this._debugPrefix} order=stroke (画数順) applied`);
    } else if (this.selectedOrder === 'random') {
      availableKanjis = this.shuffleArray(availableKanjis);
      console.log(`${this._debugPrefix} order=random applied`);
    }

    // 10問を抽出
    this.quizList = availableKanjis.slice(0, 10);
    this.currentQuestionIndex = 0;
    this.sessionHistory = [];
    const quizIds = this.quizList.map((item) => item['ID']);
    console.log(`${this._debugPrefix} quizList selected count=${this.quizList.length} IDs=`, quizIds);
    const dupCount = quizIds.filter((id) => usedIds.includes(id)).length;
    console.log(`${this._debugPrefix} duplicates vs usedIds count=${dupCount}`);

    // 出題済みIDリストを更新
    const newUsedIds = usedIds.concat(
      this.quizList.map((item) => item['ID'])
    );
    localStorage.setItem(progressKey, JSON.stringify(newUsedIds));
    const verifyIds = JSON.parse(localStorage.getItem(progressKey) || '[]');
    console.log(`${this._debugPrefix} newUsedIds length=${newUsedIds.length}, verify length=${verifyIds.length}`);

    // クイズ画面に遷移
    this.showQuiz();
  }

  showQuiz() {
    this.currentQuestionIndex = 0;
    this.displayQuestion();
    this.showScreen('quizScreen');
  }

  displayQuestion() {
    if (this.currentQuestionIndex >= this.quizList.length) {
      this.showCompletion();
      return;
    }

    const question = this.quizList[this.currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = `${
      this.currentQuestionIndex + 1
    }問目`;

    document.getElementById('readQuiz').style.display = 'block';

    document.getElementById('quizKanji').textContent = question.漢字;
    const strokeCountEl = document.getElementById('strokeCount');
    if (strokeCountEl) {
      const strokes = question.画数 || '不明';
      strokeCountEl.textContent = `画数：${strokes}`;
    }
    document.getElementById('answerDisplay').style.display = 'block';
    document.getElementById('showAnswerBtn').style.display = 'block';
    document.getElementById('nextQuizBtn').style.display = 'none';
    document.getElementById('kunReading').textContent = '';
    document.getElementById('onReading').textContent = '';

    this.sessionHistory.push(question);
  }

  showAnswer() {
    const question = this.quizList[this.currentQuestionIndex];
    const kunReading = question.訓読み || '（なし）';
    const onReading = question.音読み || '（なし）';

    document.getElementById('kunReading').textContent = kunReading;
    document.getElementById('onReading').textContent = onReading;
    document.getElementById('answerDisplay').style.display = 'block';
    document.getElementById('nextQuizBtn').style.display = 'inline-flex';
    document.getElementById('showAnswerBtn').style.display = 'none';
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.displayQuestion();
  }

  showCompletion() {
    const completedList = this.quizList
      .map((item) => item.漢字)
      .join('  ');

    document.getElementById('completedKanjis').textContent = completedList;

    // 学習履歴をhistoryManagerに保存
    if (typeof historyManager !== 'undefined') {
      const kanjiList = this.quizList.map((item) => item.漢字).join('');
      const recordData = {
        grade: this.selectedGrade,
        type: this.selectedType,
        order: this.selectedOrder,
        correctCount: this.quizList.length,
        totalCount: this.quizList.length,
        kanjis: kanjiList
      };
      console.log(`${this._debugPrefix} saveRecord(tankanji):`, recordData);
      historyManager.saveRecord('tankanji', recordData);
    } else {
      // historyManagerが未定義の場合は何もしない
    }

    this.showScreen('completionScreen');
  }

  showHistory() {
    const historyData = JSON.parse(
      localStorage.getItem(this.historyKey) || '[]'
    );

    const historyContent = document.getElementById('historyContent');

    if (historyData.length === 0) {
      historyContent.innerHTML = '<p>学習履歴がありません</p>';
    } else {
      const historyHTML = historyData
        .map(
          (session) =>
            `
        <div class="history-session">
          <div class="session-date">${session.date}</div>
          <div class="session-grade">学年: ${session.grade}年</div>
          <div class="session-kanjis">${session.kanjis}</div>
        </div>
      `
        )
        .join('');

      historyContent.innerHTML = historyHTML;
    }

    this.showScreen('historyScreen');
  }

  backToSetting() {
    // 画面移動では進捗（localStorage）はリセットしない
    console.log(`${this._debugPrefix} backToSetting: keep progress in localStorage`);

    // 設定をリセット
    this.selectedGrade = null;
    this.selectedOrder = null;
    this.selectedType = 'read';

    document.getElementById('gradeSelect').value = '';
    document.getElementById('orderSection').style.display = 'none';
    document.getElementById('startSection').style.display = 'none';

    document.querySelectorAll('#orderSection .option-btn').forEach((btn) => {
      btn.classList.remove('selected');
    });

    this.showScreen('settingScreen');
  }

  showScreen(screenId) {
    // 全スクリーンを非表示
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.remove('active');
    });

    // 指定されたスクリーンを表示
    document.getElementById(screenId).classList.add('active');
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// アプリケーションの初期化
const app = new TankanjiBuddy();
