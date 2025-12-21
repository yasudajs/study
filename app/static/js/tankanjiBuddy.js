/**
 * 単漢字練習 - メインロジック
 */

class TankanjiBuddy {
  constructor() {
    // 設定
    this.selectedGrade = null;
    this.selectedOrder = null;
    this.selectedType = null;

    // クイズ状態
    this.quizList = [];
    this.currentQuestionIndex = 0;
    this.sessionHistory = [];

    // ローカルストレージのキープレフィックス
    this.progressKey = (grade, type) => `tankanji_progress_${grade}_${type}`;
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

    // 練習種別選択ボタン
    document.getElementById('readTypeBtn').addEventListener('click', (e) =>
      this.onTypeSelect(e)
    );
    document.getElementById('writeTypeBtn').addEventListener('click', (e) =>
      this.onTypeSelect(e)
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

    // 書き練習
    document.getElementById('nextWriteQuizBtn').addEventListener('click', () =>
      this.nextQuestion()
    );

    // 完了画面
    document.getElementById('restartBtn').addEventListener('click', () =>
      this.startQuiz()
    );
    document.getElementById('goToHistoryBtn').addEventListener('click', () =>
      this.showHistory()
    );
    document.getElementById('backToSettingFromCompletionBtn').addEventListener('click', () =>
      this.backToSetting()
    );

    // 履歴画面
    document.getElementById('backToSettingFromHistoryBtn').addEventListener('click', () =>
      this.backToSetting()
    );

    // 初期画面表示
    this.showScreen('settingScreen');
  }

  onGradeSelect(e) {
    this.selectedGrade = e.target.value ? parseInt(e.target.value) : null;

    if (this.selectedGrade) {
      document.getElementById('orderSection').style.display = 'block';
      // リセット
      this.selectedOrder = null;
      this.selectedType = null;
      document.getElementById('typeSection').style.display = 'none';
      document.getElementById('startSection').style.display = 'none';
      // 順序ボタンのリセット
      document.querySelectorAll('.option-btn').forEach((btn) => {
        btn.classList.remove('selected');
      });
    } else {
      document.getElementById('orderSection').style.display = 'none';
      document.getElementById('typeSection').style.display = 'none';
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

    // 練習種別選択を表示
    document.getElementById('typeSection').style.display = 'block';
    this.selectedType = null;
    document.getElementById('startSection').style.display = 'none';
    // 種別ボタンのリセット
    document.querySelectorAll('#typeSection .option-btn').forEach((btn) => {
      btn.classList.remove('selected');
    });
  }

  onTypeSelect(e) {
    this.selectedType = e.target.dataset.type;
    e.target.classList.add('selected');
    // 他のボタンから選択を外す
    document.querySelectorAll('#typeSection .option-btn').forEach((btn) => {
      if (btn !== e.target) {
        btn.classList.remove('selected');
      }
    });

    // 開始ボタンを表示
    document.getElementById('startSection').style.display = 'flex';
  }

  async startQuiz() {
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

    if (gradeKanjis.length === 0) {
      alert('該当する漢字がありません');
      return;
    }

    // 出題済みIDを取得
    const progressKey = this.progressKey(this.selectedGrade, this.selectedType);
    const usedIds = JSON.parse(localStorage.getItem(progressKey) || '[]');

    // 出題対象の漢字を抽出
    let availableKanjis = gradeKanjis.filter(
      (item) => !usedIds.includes(item['ID'])
    );

    // 全て出題済みの場合、リセット
    if (availableKanjis.length === 0) {
      localStorage.removeItem(progressKey);
      availableKanjis = gradeKanjis;
    }

    // 順序でソート
    if (this.selectedOrder === 'stroke') {
      availableKanjis.sort((a, b) => parseInt(a.画数) - parseInt(b.画数));
    } else if (this.selectedOrder === 'random') {
      availableKanjis = this.shuffleArray(availableKanjis);
    }

    // 10問を抽出
    this.quizList = availableKanjis.slice(0, 10);
    this.currentQuestionIndex = 0;
    this.sessionHistory = [];

    // 出題済みIDリストを更新
    const newUsedIds = usedIds.concat(
      this.quizList.map((item) => item['ID'])
    );
    localStorage.setItem(progressKey, JSON.stringify(newUsedIds));

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

    if (this.selectedType === 'read') {
      document.getElementById('readQuiz').style.display = 'block';
      document.getElementById('writeQuiz').style.display = 'none';

      document.getElementById('quizKanji').textContent = question.漢字;
      document.getElementById('answerDisplay').style.display = 'none';
      document.getElementById('showAnswerBtn').style.display = 'block';
    } else {
      document.getElementById('readQuiz').style.display = 'none';
      document.getElementById('writeQuiz').style.display = 'block';

      document.getElementById('writeKanji').textContent = question.漢字;
    }

    this.sessionHistory.push(question);
  }

  showAnswer() {
    const question = this.quizList[this.currentQuestionIndex];
    const kunReading = question.訓読み || '（なし）';
    const onReading = question.音読み || '（なし）';

    document.getElementById('kunReading').textContent = kunReading;
    document.getElementById('onReading').textContent = onReading;
    document.getElementById('answerDisplay').style.display = 'block';
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
          <div class="session-type">種別: ${
              session.type === 'read' ? '読み練習' : '書き練習'
            }</div>
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
    // 設定をリセット
    this.selectedGrade = null;
    this.selectedOrder = null;
    this.selectedType = null;

    document.getElementById('gradeSelect').value = '';
    document.getElementById('orderSection').style.display = 'none';
    document.getElementById('typeSection').style.display = 'none';
    document.getElementById('startSection').style.display = 'none';

    document.querySelectorAll('.option-btn').forEach((btn) => {
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
