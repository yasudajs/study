/**
 * 四則演算アプリ - 問題生成ロジック
 */

class CalcLogic {
    constructor(operator, digits, customSettings) {
        this.operator = operator;
        this.digits = digits;
        this.customSettings = customSettings || {};
        this.quizzes = [];
        this.currentIndex = 0;

        // 演算子記号
        this.operatorSymbols = {
            'add': '+',
            'sub': '-',
            'mul': '×',
            'div': '÷'
        };
    }

    /**
     * 問題を生成
     * 10問生成する
     */
    generateQuizzes() {
        this.quizzes = [];
        const count = 10;

        for (let i = 0; i < count; i++) {
            this.quizzes.push(this.generateSingleQuiz(i));
        }

        this.currentIndex = 0;
        return this.quizzes;
    }

    /**
     * 1問生成
     */
    generateSingleQuiz(index) {
        let num1, num2, answer;
        const range = this.getRange();

        // 演算ごとの生成ロジック
        switch (this.operator) {
            case 'add':
                num1 = this.getRandomInt(range.min, range.max);
                num2 = this.getRandomInt(range.min, range.max);
                answer = num1 + num2;
                break;

            case 'sub':
                // 引かれる数を大きくする（答えが負にならないようにする場合）
                // ただし、自由設定で負の数を許可する場合は単純ランダムで良いが、
                // Issueには「基本的には正の整数」とあるので、原則 num1 >= num2 にする
                // Custom設定でMinが負の場合はその限りではない
                num1 = this.getRandomInt(range.min, range.max);
                num2 = this.getRandomInt(range.min, range.max);

                // デフォルトの動作：答えが負にならないように入れ替え
                if (range.min >= 0 && num1 < num2) {
                    [num1, num2] = [num2, num1];
                }
                answer = num1 - num2;
                break;

            case 'mul':
                num1 = this.getRandomInt(range.min, range.max);
                num2 = this.getRandomInt(range.min, range.max);
                answer = num1 * num2;
                break;

            case 'div':
                // 割り切れる問題を作る：逆算（Answer * num2 = num1）
                // num2（割る数）は0にならないように
                let minDiv = range.min === 0 ? 1 : range.min;
                // 1桁の場合は 1~9
                if (this.digits !== 'custom' && minDiv < 1) minDiv = 1;

                // 答えと割る数を生成して、割られる数を計算
                answer = this.getRandomInt(range.min, range.max);
                num2 = this.getRandomInt(minDiv, range.max);

                // 0除算回避
                if (num2 === 0) num2 = 1;

                num1 = answer * num2;
                break;
        }

        return {
            id: index,
            num1: num1,
            num2: num2,
            operator: this.operatorSymbols[this.operator],
            correct_answer: answer,
            multiplicand: num1, // 互換性のため
            multiplier: num2    // 互換性のため
        };
    }

    /**
     * 桁数またはカスタム設定から範囲を取得
     */
    getRange() {
        if (this.digits === 'custom') {
            return {
                min: parseInt(this.customSettings.min, 10) || 1,
                max: parseInt(this.customSettings.max, 10) || 100
            };
        }

        const d = parseInt(this.digits, 10);
        const min = Math.pow(10, d - 1);
        const max = Math.pow(10, d) - 1;

        // 1桁の場合は0を含まない1-9にするか？ Issueには「1桁」とあるのみ。
        // 九九アプリではないので0も含む可能性があるが、
        // 一般的なドリルでは自然数が多い。ここでは1からスタートにする。
        return {
            min: min === 1 ? 1 : min,
            max: max
        };
    }

    /**
     * ランダム整数生成
     */
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getCurrentQuiz() {
        return this.quizzes[this.currentIndex];
    }

    moveToNext() {
        this.currentIndex++;
        return this.getCurrentQuiz();
    }

    getTotalCount() {
        return this.quizzes.length;
    }

    getCurrentQuestionNumber() {
        return this.currentIndex + 1;
    }
}
