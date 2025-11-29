/**
 * 九九練習 - メインアプリケーション
 * UI制御とクライアント側での全処理を実施
 */

class KukuApp {
    constructor() {
        this.selectedLevels = [];
        this.selectedMode = 'sequential';
        this.quizLogic = null;
        this.scorer = null;
        this.sessionId = null;
        this.stateManager = new StateManager();
        this.currentAnswer = '';  // 現在の入力値
        
        // 初期化
        this.init();
    }

    init() {
        // イベントリスナー登録
        this.registerEventListeners();
        
        // 保存された状態があれば復元
        const savedState = this.stateManager.loadFromLocalStorage();
        if (savedState) {
            console.log('Restoring saved state:', savedState);
        }
    }

    registerEventListeners() {
        // レベル選択ボタン
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.onLevelSelect(e.target));
        });

        // 進むボタン
        const proceedBtn = document.getElementById('proceed-to-mode');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => this.proceedToModeSelect());
        }

        // リセットボタン
        const clearBtn = document.getElementById('clear-selection');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSelection());
        }

        // 出題方式ボタン
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.onModeSelect(e.target));
        });

        // スタートボタン
        const startBtn = document.getElementById('start-quiz');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQuiz());
        }

        // 戻るボタン（モード選択からレベル選択へ）
        const backBtn = document.getElementById('back-to-level');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToLevelSelect());
        }

        // 答えるボタン
        const submitBtn = document.getElementById('submit-answer');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAnswer());
        }

        // 数値入力ボタン
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = e.target.dataset.number;
                if (number !== undefined) {
                    this.addNumberToInput(number);
                }
            });
        });

        // 削除ボタン
        const clearInputBtn = document.getElementById('clear-input');
        if (clearInputBtn) {
            clearInputBtn.addEventListener('click', () => this.clearNumberInput());
        }

        // Enterキーで送信
        const answerInput = document.getElementById('answer-input');
        if (answerInput) {
            answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitAnswer();
                }
            });
        }

        // 結果画面のボタン
        const retryBtn = document.getElementById('retry-quiz');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryQuiz());
        }

        const changeLevelBtn = document.getElementById('change-level');
        if (changeLevelBtn) {
            changeLevelBtn.addEventListener('click', () => this.changeLevel());
        }

        const portalBtn = document.getElementById('back-to-portal');
        if (portalBtn) {
            portalBtn.addEventListener('click', () => {
                location.href = '/';
            });
        }
    }

    /**
     * レベル選択イベント
     */
    onLevelSelect(btn) {
        const level = parseInt(btn.dataset.level, 10);

        if (this.selectedLevels.includes(level)) {
            // 既に選択されている場合は解除
            this.selectedLevels = this.selectedLevels.filter(l => l !== level);
            btn.classList.remove('selected');
        } else {
            // 追加
            this.selectedLevels.push(level);
            btn.classList.add('selected');
        }

        // 状態を保存
        this.stateManager.updateState({
            selectedLevels: this.selectedLevels
        });

        // 進むボタンの有効/無効を更新
        this.updateProceedButton();
    }

    /**
     * 進むボタンの有効/無効を更新
     */
    updateProceedButton() {
        const proceedBtn = document.getElementById('proceed-to-mode');
        if (proceedBtn) {
            if (this.selectedLevels.length > 0) {
                proceedBtn.disabled = false;
            } else {
                proceedBtn.disabled = true;
            }
        }
    }

    /**
     * 出題方式選択画面に進む
     */
    proceedToModeSelect() {
        if (this.selectedLevels.length === 0) {
            alert('最低1つの段を選択してください');
            return;
        }
        this.showScreen('screen-select-mode');
    }

    /**
     * 選択をリセット
     */
    clearSelection() {
        this.selectedLevels = [];
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.stateManager.updateState({ selectedLevels: [] });
        this.updateProceedButton();
    }

    /**
     * 出題方式選択イベント
     */
    onModeSelect(btn) {
        const mode = btn.dataset.mode;
        this.selectedMode = mode;

        // UI更新
        document.querySelectorAll('.mode-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');

        this.stateManager.updateState({ selectedMode: mode });
    }

    /**
     * 画面遷移（スクリーンの表示/非表示）
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }

    /**
     * クイズ開始
     */
    async startQuiz() {
        if (this.selectedLevels.length === 0) {
            alert('段を選択してください');
            return;
        }

        // サーバー側にセッション作成リクエスト（API呼び出し削減版）
        try {
            const response = await fetch('/kuku/api/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    levels: this.selectedLevels,
                    mode: this.selectedMode
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Session creation failed: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            this.sessionId = data.session_id;

            // クイズロジック初期化
            this.quizLogic = new QuizLogic(this.selectedLevels, this.selectedMode);
            const quizzes = this.quizLogic.generateQuizzes();

            // 採点器初期化
            this.scorer = new Scorer();

            // 状態保存
            this.stateManager.updateState({
                sessionId: this.sessionId,
                selectedLevels: this.selectedLevels,
                selectedMode: this.selectedMode,
                totalQuizzes: quizzes.length
            });

            // クイズ画面へ
            this.showScreen('screen-quiz');
            this.displayQuiz();

        } catch (error) {
            console.error('Error starting quiz:', error);
            alert('クイズ開始時にエラーが発生しました: ' + error.message);
        }
    }

    /**
     * クイズ表示
     */
    displayQuiz() {
        if (!this.quizLogic) return;

        const quiz = this.quizLogic.getCurrentQuiz();
        if (!quiz) return;

        // 問題を表示
        document.getElementById('quiz-number1').textContent = quiz.multiplicand;
        document.getElementById('quiz-number2').textContent = quiz.multiplier;

        // カウント更新
        const currentNum = this.quizLogic.getCurrentQuestionNumber();
        const totalNum = this.quizLogic.getTotalCount();
        document.getElementById('current-question').textContent = currentNum;
        document.getElementById('total-questions').textContent = totalNum;

        // プログレスバー更新
        const progress = document.getElementById('progress-bar');
        progress.max = totalNum;
        progress.value = currentNum;

        // 答え欄をリセット
        this.currentAnswer = '';
        const quizAnswer = document.getElementById('quiz-answer');
        if (quizAnswer) {
            quizAnswer.textContent = '?';
        }

        // フィードバッククリア
        document.getElementById('feedback').innerHTML = '';
    }

    /**
     * 回答送信
     */
    /**
     * 数値をインプットに追加
     */
    addNumberToInput(number) {
        const quizAnswer = document.getElementById('quiz-answer');
        // 最大2桁（81が最大値）
        if (this.currentAnswer.length < 2) {
            this.currentAnswer += number;
            // 問題文の「?」を入力値に更新
            if (quizAnswer) {
                quizAnswer.textContent = this.currentAnswer;
            }
        }
    }

    /**
     * インプットをクリア
     */
    clearNumberInput() {
        const quizAnswer = document.getElementById('quiz-answer');
        this.currentAnswer = '';
        // 問題文の「?」をリセット
        if (quizAnswer) {
            quizAnswer.textContent = '?';
        }
    }

    submitAnswer() {
        if (!this.quizLogic || !this.scorer) return;

        const userAnswer = this.currentAnswer.trim();

        if (userAnswer === '') {
            alert('答えを入力してください');
            return;
        }

        const quiz = this.quizLogic.getCurrentQuiz();
        const isCorrect = this.scorer.score(quiz, userAnswer);

        // モーダルで結果を表示
        this.showResultModal(isCorrect, quiz);

        // 次の問題へ進むか、終了するか
        if (this.quizLogic.moveToNext()) {
            // 次の問題あり
            setTimeout(() => {
                this.hideResultModal();
                this.displayQuiz();
            }, 2000);
        } else {
            // クイズ終了
            setTimeout(() => {
                this.hideResultModal();
                this.showResult();
            }, 2500);
        }
    }

    /**
     * 正解不正解をモーダルで表示
     */
    showResultModal(isCorrect, quiz) {
        const modal = document.getElementById('result-modal');
        const symbol = document.getElementById('result-symbol');
        const text = document.getElementById('result-text');

        if (isCorrect) {
            modal.className = 'result-modal active correct';
            symbol.textContent = '○';
            text.textContent = '正解です！';
        } else {
            modal.className = 'result-modal active incorrect';
            symbol.textContent = '×';
            text.textContent = `不正解です。正解は ${quiz.correct_answer} です。`;
        }
    }

    /**
     * モーダルを非表示
     */
    hideResultModal() {
        const modal = document.getElementById('result-modal');
        modal.classList.remove('active');
    }

    /**
     * 結果表示（全てクライアント側で計算）
     */
    async showResult() {
        const summary = this.scorer.getSummary();

        // 結果を画面に表示
        document.getElementById('result-score').textContent = 
            `${summary.correct_count}/${summary.total_count}`;
        document.getElementById('result-rate').textContent = 
            `${summary.correct_rate}%`;
        document.getElementById('result-correct-count').textContent = 
            summary.correct_count;
        document.getElementById('result-incorrect-count').textContent = 
            summary.total_count - summary.correct_count;

        // 回答履歴を表示
        this.displayAnswerHistory();

        // 結果をサーバーに送信（1回のAPI呼び出しのみ）
        try {
            const response = await fetch('/kuku/api/result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    correct_count: summary.correct_count,
                    total_count: summary.total_count,
                    correct_rate: summary.correct_rate
                })
            });

            if (!response.ok) {
                console.error('Failed to save result');
            }
        } catch (error) {
            console.error('Error saving result:', error);
        }

        // 状態保存
        this.stateManager.updateState({
            result: summary,
            answers: this.scorer.getAnswers()
        });

        // 結果画面表示
        this.showScreen('screen-result');
    }

    /**
     * 回答履歴を表示
     */
    displayAnswerHistory() {
        const historyContainer = document.getElementById('answer-history');
        if (!historyContainer) return;

        const answers = this.scorer.getAnswers();
        let historyHTML = '<div class="history-items">';

        answers.forEach((answer, index) => {
            const statusClass = answer.is_correct ? 'correct' : 'incorrect';
            const statusSymbol = answer.is_correct ? '○' : '×';
            
            historyHTML += `
                <div class="history-item ${statusClass}">
                    <span class="history-number">問${index + 1}</span>
                    <span class="history-problem">${answer.multiplicand} × ${answer.multiplier} = ${answer.correct_answer}</span>
                    <span class="history-answer">あなたの回答: ${answer.user_answer}</span>
                    <span class="history-status">${statusSymbol}</span>
                </div>
            `;
        });

        historyHTML += '</div>';
        historyContainer.innerHTML = historyHTML;
    }

    /**
     * もう一度実行
     */
    retryQuiz() {
        this.selectedLevels = this.stateManager.state.selectedLevels;
        this.selectedMode = this.stateManager.state.selectedMode;
        this.startQuiz();
    }

    /**
     * レベル変更
     */
    changeLevel() {
        this.clearSelection();
        this.showScreen('screen-select-level');
    }

    /**
     * モード選択画面へ戻る
     */
    backToLevelSelect() {
        this.showScreen('screen-select-level');
    }
}

/**
 * 状態管理クラス
 */
class StateManager {
    constructor() {
        this.state = {
            selectedLevels: [],
            selectedMode: 'sequential',
            sessionId: null,
            totalQuizzes: 0,
            result: null
        };
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        localStorage.setItem('kuku_app_state', JSON.stringify(this.state));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('kuku_app_state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                return this.state;
            } catch (e) {
                console.error('Failed to load state:', e);
            }
        }
        return null;
    }

    clearState() {
        this.state = {
            selectedLevels: [],
            selectedMode: 'sequential',
            sessionId: null,
            totalQuizzes: 0,
            result: null
        };
        localStorage.removeItem('kuku_app_state');
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.kukuApp = new KukuApp();
});
