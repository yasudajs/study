/**
 * 四則演算練習 - メインロジック
 * すべてクライアント側で問題生成・採点を行う（DBやAPIは使用しない）
 */

class ShisokuApp {
    constructor() {
        this.selectedOperations = [];
        this.difficulty = 'easy';
        this.rangeMode = 'single'; // 'single' | 'custom'
        this.maxValue = 9;
        this.quizLength = 10;
        this.quizzes = [];
        this.currentIndex = 0;
        this.currentAnswer = '';
        this.currentRemainder = '';
        this.activeTarget = 'answer';
        this.startTime = null;
        this.timerInterval = null;
        this.scorer = new ShisokuScorer();

        this.registerEventListeners();
    }

    registerEventListeners() {
        // 演算ボタン
        document.querySelectorAll('.operation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleOperation(e.currentTarget));
        });

        // 難易度ボタン
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e.currentTarget));
        });

        // 範囲モード切替
        document.querySelectorAll('input[name="range-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.onRangeModeChange(e.currentTarget.value));
        });

        // スタート
        const startBtn = document.getElementById('start-quiz');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQuiz());
        }

        // 数値入力ボタン
        document.querySelectorAll('.number-btn[data-number]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const num = e.currentTarget.dataset.number;
                this.addNumberToInput(num);
            });
        });

        // 符号切替（引き算で使用）
        const signBtn = document.getElementById('toggle-sign');
        if (signBtn) {
            signBtn.addEventListener('click', () => this.toggleSign());
        }

        // 削除
        const clearBtn = document.getElementById('clear-input');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearNumberInput());
        }

        // 答える
        const submitBtn = document.getElementById('submit-answer');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAnswer());
        }

        // 入力ターゲット切替
        document.querySelectorAll('.quiz-answer-input').forEach(el => {
            el.addEventListener('click', () => this.setActiveTarget(el.dataset.target));
        });

        document.querySelectorAll('.toggle-target').forEach(btn => {
            btn.addEventListener('click', (e) => this.setActiveTarget(e.currentTarget.dataset.target));
        });

        // 結果画面のボタン
        const retryBtn = document.getElementById('retry-quiz');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryQuiz());
        }

        const backSetupBtn = document.getElementById('back-to-setup');
        if (backSetupBtn) {
            backSetupBtn.addEventListener('click', () => {
                this.stopTimer();
                this.showScreen('screen-setup');
            });
        }

        const portalBtn = document.getElementById('back-to-portal');
        if (portalBtn) {
            portalBtn.addEventListener('click', () => {
                location.href = '/';
            });
        }
    }

    toggleOperation(btn) {
        const op = btn.dataset.op;
        if (this.selectedOperations.includes(op)) {
            this.selectedOperations = this.selectedOperations.filter(o => o !== op);
            btn.classList.remove('active');
        } else {
            this.selectedOperations.push(op);
            btn.classList.add('active');
        }
    }

    selectDifficulty(btn) {
        this.difficulty = btn.dataset.level;
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    onRangeModeChange(mode) {
        this.rangeMode = mode;
        const upperLimit = document.getElementById('upper-limit');
        if (!upperLimit) return;
        if (mode === 'custom') {
            upperLimit.disabled = false;
            upperLimit.focus();
        } else {
            upperLimit.disabled = true;
            upperLimit.value = '';
        }
    }

    showMessage(targetId, text) {
        const el = document.getElementById(targetId);
        if (el) {
            el.textContent = text || '';
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
    }

    validateSetup() {
        if (this.selectedOperations.length === 0) {
            this.showMessage('setup-message', '演算を1つ以上選択してください');
            return false;
        }

        if (this.rangeMode === 'custom') {
            const upperLimitInput = document.getElementById('upper-limit');
            const value = upperLimitInput ? parseInt(upperLimitInput.value, 10) : NaN;
            if (Number.isNaN(value)) {
                this.showMessage('setup-message', '上限値を入力してください');
                return false;
            }
            if (value < 10 || value > 9999) {
                this.showMessage('setup-message', '上限値は10～9999で入力してください');
                return false;
            }
            this.maxValue = value;
        } else {
            this.maxValue = 9;
        }

        this.showMessage('setup-message', '');
        return true;
    }

    startQuiz() {
        if (!this.validateSetup()) return;

        this.scorer.reset();
        this.quizzes = this.generateQuizzes();
        this.currentIndex = 0;
        this.currentAnswer = '';
        this.currentRemainder = '';
        this.setActiveTarget('answer');

        // 画面遷移
        this.showScreen('screen-quiz');
        this.updateProgress();
        this.displayQuiz();

        // タイマー開始
        this.startTime = Date.now();
        this.startTimer();
    }

    generateQuizzes() {
        const quizzes = [];
        for (let i = 0; i < this.quizLength; i++) {
            const op = this.selectedOperations[Math.floor(Math.random() * this.selectedOperations.length)];
            quizzes.push(this.createQuestion(op));
        }
        return quizzes;
    }

    createQuestion(operation) {
        const max = Math.max(1, this.maxValue);
        const a = this.getRandomInt(0, max);
        const b = this.getRandomInt(0, max);
        let operand1 = a;
        let operand2 = b;
        let correctAnswer = 0;
        let correctRemainder = 0;

        switch (operation) {
            case 'add':
                correctAnswer = operand1 + operand2;
                break;
            case 'subtract':
                if (this.difficulty === 'easy' && operand2 > operand1) {
                    [operand1, operand2] = [operand2, operand1];
                }
                correctAnswer = operand1 - operand2;
                break;
            case 'multiply':
                correctAnswer = operand1 * operand2;
                break;
            case 'divide': {
                const divisor = Math.max(1, operand2 || 1);
                if (this.difficulty === 'easy') {
                    const quotient = this.getRandomInt(0, Math.max(1, Math.floor(max / divisor)));
                    operand1 = divisor * quotient;
                    operand2 = divisor;
                    correctAnswer = operand2 === 0 ? 0 : operand1 / operand2;
                    correctRemainder = 0;
                } else {
                    operand2 = Math.max(1, operand2); // 0除算防止
                    operand1 = this.getRandomInt(0, max);
                    correctAnswer = Math.floor(operand1 / operand2);
                    correctRemainder = operand1 % operand2;
                }
                break;
            }
            default:
                correctAnswer = 0;
        }

        return {
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            operation,
            operand1,
            operand2,
            correct_answer: correctAnswer,
            correct_remainder: correctRemainder,
            requires_remainder: operation === 'divide' && this.difficulty === 'hard',
            operator_symbol: this.getOperatorSymbol(operation)
        };
    }

    getOperatorSymbol(op) {
        switch (op) {
            case 'add': return '＋';
            case 'subtract': return '−';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '?';
        }
    }

    getRandomInt(min, max) {
        const mn = Math.ceil(min);
        const mx = Math.floor(max);
        return Math.floor(Math.random() * (mx - mn + 1)) + mn;
    }

    displayQuiz() {
        const quiz = this.quizzes[this.currentIndex];
        if (!quiz) return;

        const num1 = document.getElementById('quiz-number1');
        const num2 = document.getElementById('quiz-number2');
        const op = document.getElementById('quiz-operator');

        if (num1) num1.textContent = quiz.operand1;
        if (num2) num2.textContent = quiz.operand2;
        if (op) op.textContent = quiz.operator_symbol;

        this.currentAnswer = '';
        this.currentRemainder = '';
        this.updateAnswerDisplays();
        this.updateProgress();
        this.showMessage('quiz-message', '');

        const remainderWrapper = document.getElementById('remainder-wrapper');
        const inputToggles = document.getElementById('input-toggles');
        if (quiz.requires_remainder) {
            remainderWrapper?.classList.remove('hidden');
            inputToggles?.classList.remove('hidden');
            this.setActiveTarget('answer');
        } else {
            remainderWrapper?.classList.add('hidden');
            inputToggles?.classList.add('hidden');
            this.setActiveTarget('answer');
        }
    }

    updateAnswerDisplays() {
        const answerEl = document.getElementById('quiz-answer');
        const remEl = document.getElementById('quiz-remainder');
        if (answerEl) answerEl.textContent = this.currentAnswer || '?';
        if (remEl) remEl.textContent = this.currentRemainder || '?';
    }

    updateProgress() {
        const currentNum = this.currentIndex + 1;
        const total = this.quizLength;
        const currentEl = document.getElementById('current-question');
        const totalEl = document.getElementById('total-questions');
        const bar = document.getElementById('progress-bar');
        if (currentEl) currentEl.textContent = currentNum;
        if (totalEl) totalEl.textContent = total;
        if (bar) {
            bar.max = total;
            bar.value = currentNum;
        }
    }

    addNumberToInput(number) {
        const quiz = this.quizzes[this.currentIndex];
        if (!quiz) return;

        if (this.activeTarget === 'remainder') {
            if (this.currentRemainder.length >= 4) return;
            this.currentRemainder += number;
        } else {
            if (this.currentAnswer.length >= 6) return;
            this.currentAnswer += number;
        }
        this.updateAnswerDisplays();
    }

    toggleSign() {
        const quiz = this.quizzes[this.currentIndex];
        if (!quiz || quiz.operation !== 'subtract') {
            this.showMessage('quiz-message', 'マイナスは引き算のときのみ入力できます');
            return;
        }
        if (this.activeTarget !== 'answer') return;

        if (this.currentAnswer.startsWith('-')) {
            this.currentAnswer = this.currentAnswer.slice(1);
        } else {
            this.currentAnswer = '-' + this.currentAnswer;
        }
        this.updateAnswerDisplays();
    }

    clearNumberInput() {
        if (this.activeTarget === 'remainder') {
            this.currentRemainder = '';
        } else {
            this.currentAnswer = '';
        }
        this.updateAnswerDisplays();
    }

    setActiveTarget(target) {
        this.activeTarget = target === 'remainder' ? 'remainder' : 'answer';
        document.querySelectorAll('.quiz-answer-input').forEach(el => {
            if (el.dataset.target === this.activeTarget) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
        document.querySelectorAll('.toggle-target').forEach(btn => {
            if (btn.dataset.target === this.activeTarget) {
                btn.classList.add('active');
                btn.textContent = btn.dataset.target === 'answer' ? 'こたえを入力中' : 'あまりを入力中';
            } else {
                btn.classList.remove('active');
                btn.textContent = btn.dataset.target === 'answer' ? 'こたえを入力' : 'あまりを入力';
            }
        });
    }

    submitAnswer() {
        const quiz = this.quizzes[this.currentIndex];
        if (!quiz) return;

        if (!this.currentAnswer || this.currentAnswer === '-') {
            this.showMessage('quiz-message', '答えを入力してください');
            return;
        }

        if (quiz.requires_remainder && !this.currentRemainder) {
            this.showMessage('quiz-message', 'あまりを入力してください');
            return;
        }

        const isCorrect = this.scorer.score(
            quiz,
            this.currentAnswer,
            quiz.requires_remainder ? this.currentRemainder : null
        );

        this.currentIndex += 1;

        if (this.currentIndex < this.quizLength) {
            this.displayQuiz();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        this.stopTimer();
        const summary = this.scorer.getSummary();
        const elapsedText = this.formatElapsed(summary.elapsed_ms || (Date.now() - (this.startTime || Date.now())));

        const scoreEl = document.getElementById('result-score');
        const rateEl = document.getElementById('result-rate');
        const correctEl = document.getElementById('result-correct-count');
        const incorrectEl = document.getElementById('result-incorrect-count');
        const timeEl = document.getElementById('result-time');

        if (scoreEl) scoreEl.textContent = `${summary.correct_count}/${summary.total_count}`;
        if (rateEl) rateEl.textContent = `${summary.correct_rate}%`;
        if (correctEl) correctEl.textContent = summary.correct_count;
        if (incorrectEl) incorrectEl.textContent = summary.total_count - summary.correct_count;
        if (timeEl) timeEl.textContent = elapsedText;

        this.displayAnswerHistory();

        // 履歴に保存 ✅ 追加
        if (typeof historyManager !== 'undefined') {
            const operatorMap = {
                'add': 'plus',
                'subtract': 'minus',
                'multiply': 'multiply',
                'divide': 'divide'
            };
            const mainOp = this.selectedOperations.length > 0 ? this.selectedOperations[0] : 'add';
            historyManager.saveRecord('shisoku', {
                operator: operatorMap[mainOp],
                difficulty: this.difficulty,
                range: this.rangeMode === 'custom' ? this.maxValue : 9,
                correctCount: summary.correct_count,
                totalCount: summary.total_count
            });
        }

        this.showScreen('screen-result');
    }

    displayAnswerHistory() {
        const container = document.getElementById('answer-history');
        if (!container) return;

        const answers = this.scorer.getAnswers();
        let html = '<div class="history-items">';
        answers.forEach((ans, idx) => {
            const statusClass = ans.is_correct ? 'correct' : 'incorrect';
            const statusSymbol = ans.is_correct ? '○' : '×';
            const problemText = this.formatProblemText(ans);
            const userAnswerText = ans.requires_remainder
                ? `あなたの回答: ${ans.user_answer} / あまり ${ans.user_remainder}`
                : `あなたの回答: ${ans.user_answer}`;

            html += `
                <div class="history-item ${statusClass}">
                    <span class="history-number">問${idx + 1}</span>
                    <span class="history-problem">${problemText}</span>
                    <span class="history-answer">${userAnswerText}</span>
                    <span class="history-status">${statusSymbol}</span>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    formatProblemText(ans) {
        if (ans.operation === 'divide' && ans.requires_remainder) {
            return `${ans.operand1} ÷ ${ans.operand2} = ${ans.correct_answer} (あまり ${ans.correct_remainder})`;
        }
        return `${ans.operand1} ${this.getOperatorSymbol(ans.operation)} ${ans.operand2} = ${ans.correct_answer}`;
    }

    retryQuiz() {
        // 同じ設定で再スタート
        this.startQuiz();
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - (this.startTime || now);
            const display = this.formatElapsed(elapsed);
            const el = document.getElementById('elapsed-time');
            if (el) el.textContent = display;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatElapsed(ms) {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const minutes = Math.floor(totalSec / 60);
        const seconds = totalSec % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

class ShisokuScorer {
    constructor() {
        this.answers = [];
        this.correctCount = 0;
        this.startTimestamp = null;
    }

    score(quiz, userAnswer, userRemainder) {
        if (this.startTimestamp === null) {
            this.startTimestamp = Date.now();
        }

        const parsedAnswer = parseInt(userAnswer, 10);
        const parsedRemainder = userRemainder !== null && userRemainder !== undefined
            ? parseInt(userRemainder, 10)
            : null;

        let isCorrect = false;
        if (quiz.requires_remainder) {
            isCorrect = parsedAnswer === quiz.correct_answer && parsedRemainder === quiz.correct_remainder;
        } else {
            isCorrect = parsedAnswer === quiz.correct_answer;
        }

        this.answers.push({
            operation: quiz.operation,
            operand1: quiz.operand1,
            operand2: quiz.operand2,
            correct_answer: quiz.correct_answer,
            correct_remainder: quiz.correct_remainder,
            requires_remainder: quiz.requires_remainder,
            user_answer: userAnswer,
            user_remainder: quiz.requires_remainder ? userRemainder : null,
            is_correct: isCorrect
        });

        if (isCorrect) this.correctCount += 1;
        return isCorrect;
    }

    getSummary() {
        const total = this.answers.length;
        const rate = total === 0 ? 0 : Math.round((this.correctCount / total) * 100);
        return {
            correct_count: this.correctCount,
            total_count: total,
            correct_rate: rate,
            elapsed_ms: this.startTimestamp ? Date.now() - this.startTimestamp : 0
        };
    }

    getAnswers() {
        return this.answers;
    }

    reset() {
        this.answers = [];
        this.correctCount = 0;
        this.startTimestamp = null;
    }
}

// アプリ起動
document.addEventListener('DOMContentLoaded', () => {
    window.shisokuApp = new ShisokuApp();
});
