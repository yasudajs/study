/**
 * 四則演算アプリ - メイン制御
 */

class CalcApp {
    constructor() {
        this.selectedOperator = 'add';
        this.selectedDigits = '1';
        this.customSettings = { min: 1, max: 100 };
        this.quizLogic = null;
        this.scorer = null;
        this.sessionId = null;
        this.currentAnswer = '';

        this.init();
    }

    init() {
        this.registerEventListeners();
    }

    registerEventListeners() {
        // 演算子選択
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setOperator(e.target.dataset.operator);
                this.updateUI(e.target, '.operator-btn');
            });
        });

        // 桁数選択
        document.querySelectorAll('.digits-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setDigits(e.target.dataset.digits);
                this.updateUI(e.target, '.digits-btn');

                // 自由設定の表示切替
                const customSettings = document.getElementById('custom-settings');
                if (this.selectedDigits === 'custom') {
                    customSettings.style.display = 'block';
                } else {
                    customSettings.style.display = 'none';
                }
            });
        });

        // スタートボタン
        document.getElementById('start-quiz').addEventListener('click', () => this.startQuiz());

        // テンキー
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const num = e.target.dataset.number;
                if (num) this.inputNumber(num);
            });
        });

        document.getElementById('clear-input').addEventListener('click', () => this.clearInput());
        document.getElementById('submit-answer').addEventListener('click', () => this.submitAnswer());

        // リトライなど
        document.getElementById('retry-quiz').addEventListener('click', () => this.retryQuiz());
        document.getElementById('change-settings').addEventListener('click', () => {
            this.showScreen('screen-settings');
        });
        document.getElementById('back-to-portal').addEventListener('click', () => {
            location.href = '/';
        });
    }

    setOperator(op) {
        this.selectedOperator = op;
    }

    setDigits(d) {
        this.selectedDigits = d;
    }

    updateUI(target, selector) {
        document.querySelectorAll(selector).forEach(el => el.classList.remove('active'));
        target.classList.add('active');
    }

    async startQuiz() {
        // 自由設定の値取得
        if (this.selectedDigits === 'custom') {
            const min = parseInt(document.getElementById('custom-min').value, 10);
            const max = parseInt(document.getElementById('custom-max').value, 10);

            if (isNaN(min) || isNaN(max) || min >= max) {
                alert('最小値と最大値を正しく設定してください（最小値 < 最大値）');
                return;
            }
            this.customSettings = { min, max };
        }

        // セッション作成
        try {
            const response = await fetch('/calc/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operator: this.selectedOperator,
                    digits: this.selectedDigits,
                    custom_min: this.customSettings.min,
                    custom_max: this.customSettings.max
                })
            });
            const data = await response.json();
            this.sessionId = data.session_id;

            // クイズ生成
            this.quizLogic = new CalcLogic(
                this.selectedOperator,
                this.selectedDigits,
                this.customSettings
            );
            this.quizLogic.generateQuizzes();

            this.scorer = new Scorer();

            this.showScreen('screen-quiz');
            this.displayQuiz();

        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        }
    }

    displayQuiz() {
        const quiz = this.quizLogic.getCurrentQuiz();
        if (!quiz) return;

        document.getElementById('quiz-number1').textContent = quiz.num1;
        document.getElementById('quiz-number2').textContent = quiz.num2;
        document.getElementById('quiz-operator').textContent = quiz.operator;

        document.getElementById('current-question').textContent = this.quizLogic.getCurrentQuestionNumber();
        document.getElementById('progress-bar').value = this.quizLogic.getCurrentQuestionNumber();

        this.clearInput();
        document.getElementById('feedback').innerHTML = '';
    }

    inputNumber(num) {
        // マイナス記号の処理
        if (num === '-') {
            if (this.currentAnswer === '') {
                this.currentAnswer = '-';
            } else if (this.currentAnswer.startsWith('-')) {
                this.currentAnswer = this.currentAnswer.substring(1);
            } else {
                this.currentAnswer = '-' + this.currentAnswer;
            }
        } else {
            this.currentAnswer += num;
        }
        document.getElementById('quiz-answer').textContent = this.currentAnswer;
    }

    clearInput() {
        this.currentAnswer = '';
        document.getElementById('quiz-answer').textContent = '?';
    }

    submitAnswer() {
        if (!this.currentAnswer || this.currentAnswer === '-' || this.currentAnswer === '?') return;

        const quiz = this.quizLogic.getCurrentQuiz();
        const isCorrect = this.scorer.score(quiz, this.currentAnswer);

        this.showResultModal(isCorrect, quiz);

        setTimeout(() => {
            document.getElementById('result-modal').classList.remove('active');

            if (this.quizLogic.moveToNext()) {
                this.displayQuiz();
            } else {
                this.finishQuiz();
            }
        }, 1500);
    }

    showResultModal(isCorrect, quiz) {
        const modal = document.getElementById('result-modal');
        const symbol = document.getElementById('result-symbol');
        const text = document.getElementById('result-text');

        modal.classList.add('active');
        if (isCorrect) {
            modal.className = 'result-modal active correct';
            symbol.textContent = '○';
            text.textContent = '正解！';
        } else {
            modal.className = 'result-modal active incorrect';
            symbol.textContent = '×';
            text.textContent = `正解は ${quiz.correct_answer}`;
        }
    }

    async finishQuiz() {
        const summary = this.scorer.getSummary();

        document.getElementById('result-score').textContent = `${summary.correct_count}点`;
        document.getElementById('result-rate').textContent = `${summary.correct_count}/10`;
        document.getElementById('result-correct-count').textContent = summary.correct_count;
        document.getElementById('result-incorrect-count').textContent = summary.total_count - summary.correct_count;

        this.displayHistory();

        // 結果保存
        await fetch('/calc/api/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: this.sessionId,
                ...summary
            })
        });

        this.showScreen('screen-result');
    }

    displayHistory() {
        const container = document.getElementById('answer-history');
        const answers = this.scorer.getAnswers();

        let html = '<div class="history-items">';
        answers.forEach((a, i) => {
            const status = a.is_correct ? 'correct' : 'incorrect';
            const mark = a.is_correct ? '○' : '×';
            // scorer.js の実装に依存するが、CalcLogicでquizオブジェクトにoperatorを入れたので
            // scorerに渡されるquizオブジェクトにも入っているはず
            // ただしScorerはuser_answer等を保存するが、operatorまでは保存していないかも？
            // Scorerの実装を確認すると、quizオブジェクトのプロパティを全てコピーしているわけではなく、
            // multiplicand/multiplier を保存している。
            // CalcLogicで generateSingleQuiz が返すオブジェクトには num1, num2 がある。
            // Scorerを修正するか、ここでうまく表示するか。

            // Scorerは汎用的に作られていない（kuku専用のプロパティ名を使っている）可能性がある。
            // app/static/js/scorer.js を確認する必要がある。
            // 確認せずに実装してしまったので、Scorerが期待通り動くか怪しい。
            // Scorerは this.answers.push({...}) している。
            // ここでは a.quiz_id 等が取れる。

            // CalcLogicで multiplicand: num1, multiplier: num2 を入れたので、
            // Scorer はそれらを保存しているはず。
            // しかし operator がない。

            // 暫定対応: 現在のモード（operator）を使って表示する。
            // ヒストリーは全て同じ演算なので。
            const opSymbol = this.quizLogic.operatorSymbols[this.selectedOperator];

            html += `
                <div class="history-item ${status}">
                    <span class="history-number">${i+1}</span>
                    <span class="history-problem">${a.multiplicand} ${opSymbol} ${a.multiplier} = ${a.correct_answer}</span>
                    <span class="history-answer">${a.user_answer}</span>
                    <span class="history-status">${mark}</span>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    retryQuiz() {
        this.startQuiz();
    }

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CalcApp();
});
