/**
 * 九九練習 - 出題ロジック
 * クライアント側で全ての問題生成を実施
 */

class QuizLogic {
    constructor(levels, mode = 'sequential') {
        this.levels = levels;
        this.mode = mode;
        this.quizzes = [];
        this.currentIndex = 0;
    }

    /**
     * 問題を生成
     */
    generateQuizzes() {
        this.quizzes = [];
        
        // 選択された段ごとに問題を生成
        for (const level of this.levels) {
            for (let i = 1; i <= 9; i++) {
                this.quizzes.push({
                    id: this.quizzes.length,
                    multiplicand: level,      // 掛ける数
                    multiplier: i,             // 掛けられる数
                    correct_answer: level * i
                });
            }
        }
        
        // モードに応じて問題を並べ替え
        if (this.mode === 'random') {
            this.shuffleQuizzes();
        }
        
        this.currentIndex = 0;
        return this.quizzes;
    }

    /**
     * Fisher-Yates シャッフルアルゴリズムで問題をランダムに並べ替え
     */
    shuffleQuizzes() {
        for (let i = this.quizzes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.quizzes[i], this.quizzes[j]] = [this.quizzes[j], this.quizzes[i]];
        }
    }

    /**
     * 現在の問題を取得
     */
    getCurrentQuiz() {
        if (this.currentIndex < this.quizzes.length) {
            return this.quizzes[this.currentIndex];
        }
        return null;
    }

    /**
     * 次の問題に進む
     */
    moveToNext() {
        this.currentIndex++;
        return this.getCurrentQuiz();
    }

    /**
     * クイズが終了したかどうかを確認
     */
    isFinished() {
        return this.currentIndex >= this.quizzes.length;
    }

    /**
     * 全問題数を取得
     */
    getTotalCount() {
        return this.quizzes.length;
    }

    /**
     * 現在の問題番号（1-indexed）
     */
    getCurrentQuestionNumber() {
        return this.currentIndex + 1;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.QuizLogic = QuizLogic;
}
