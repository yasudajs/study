/**
 * 九九練習 - 採点ロジック
 * クライアント側で全ての採点を実施
 */

class Scorer {
    constructor() {
        this.answers = [];
        this.correctCount = 0;
    }

    /**
     * 回答を記録して採点
     * @param {object} quiz - 問題オブジェクト
     * @param {number} userAnswer - ユーザーの回答
     * @returns {boolean} - 正解したかどうか
     */
    score(quiz, userAnswer) {
        const isCorrect = this.checkAnswer(quiz, userAnswer);
        
        this.answers.push({
            quiz_id: quiz.id,
            multiplicand: quiz.multiplicand,
            multiplier: quiz.multiplier,
            user_answer: userAnswer,
            correct_answer: quiz.correct_answer,
            is_correct: isCorrect
        });
        
        if (isCorrect) {
            this.correctCount++;
        }
        
        return isCorrect;
    }

    /**
     * 回答が正しいかチェック
     * @param {object} quiz - 問題オブジェクト
     * @param {number} userAnswer - ユーザーの回答
     * @returns {boolean}
     */
    checkAnswer(quiz, userAnswer) {
        return parseInt(userAnswer, 10) === quiz.correct_answer;
    }

    /**
     * 正答率を計算
     * @returns {number} - 正答率（パーセント）
     */
    getCorrectRate() {
        if (this.answers.length === 0) {
            return 0;
        }
        return Math.round((this.correctCount / this.answers.length) * 100);
    }

    /**
     * 結果サマリーを取得
     * @returns {object}
     */
    getSummary() {
        return {
            correct_count: this.correctCount,
            total_count: this.answers.length,
            correct_rate: this.getCorrectRate()
        };
    }

    /**
     * 回答履歴を取得
     * @returns {array}
     */
    getAnswers() {
        return this.answers;
    }

    /**
     * スコアをリセット
     */
    reset() {
        this.answers = [];
        this.correctCount = 0;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.Scorer = Scorer;
}
