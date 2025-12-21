/**
 * 学習履歴管理モジュール
 * LocalStorageを使用して、全アプリ共通で履歴を管理します
 */
class HistoryManager {
  constructor() {
    this.storageKey = 'study_history';
    this.maxRecordsPerApp = 50;  // アプリ別に最大50件保持
  }

  /**
   * 履歴データを取得
   * @returns {Object} 履歴データ（{appId: [{...}, {...}], ...}）
   */
  getHistory() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  /**
   * 学習結果を保存
   * @param {string} appId - アプリID（kuku, shisoku等）
   * @param {Object} record - 保存するレコード
   */
  saveRecord(appId, record) {
    const history = this.getHistory();

    if (!history[appId]) {
      history[appId] = [];
    }

    // 新しいレコードを先頭に追加（メタデータ自動付加）
    history[appId].unshift({
      date: this.getTodayDate(),
      time: this.getCurrentTime(),
      timestamp: Math.floor(Date.now() / 1000),
      ...record,
      correctRate: Math.round(
        (record.correctCount / record.totalCount) * 100
      )
    });

    // 最大件数を超えた場合は古い順に削除
    if (history[appId].length > this.maxRecordsPerApp) {
      history[appId] = history[appId].slice(0, this.maxRecordsPerApp);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(history));

    // サーバーに非同期で送信（将来のDB保存対応）
    this._syncToServer(appId, history[appId][0]);
  }

  /**
   * アプリ別の最新記録を取得
   * @param {string} appId - アプリID
   * @param {number} count - 取得件数（デフォルト5件）
   * @returns {Array} 履歴レコードの配列
   */
  getLatestRecords(appId, count = 5) {
    const history = this.getHistory();
    return history[appId] ? history[appId].slice(0, count) : [];
  }

  /**
   * 今日の成績を集計
   * @param {string} appId - アプリID
   * @returns {Object|null} 本日の統計情報
   */
  getTodayStats(appId) {
    const history = this.getHistory();
    const todayDate = this.getTodayDate();
    const todayRecords = history[appId]?.filter(r => r.date === todayDate) || [];

    if (todayRecords.length === 0) {
      return null;
    }

    const totalCorrect = todayRecords.reduce((sum, r) => sum + r.correctCount, 0);
    const totalQuestions = todayRecords.reduce((sum, r) => sum + r.totalCount, 0);
    const averageRate = Math.round((totalCorrect / totalQuestions) * 100);

    return {
      date: todayDate,
      attempts: todayRecords.length,
      correctRate: averageRate,
      totalCorrect,
      totalQuestions,
      records: todayRecords
    };
  }

  /**
   * 全アプリの本日の成績を取得
   * @returns {Object} {appId: statsObject, ...}
   */
  getAllTodayStats() {
    const history = this.getHistory();
    const stats = {};

    Object.keys(history).forEach(appId => {
      stats[appId] = this.getTodayStats(appId);
    });

    return stats;
  }

  /**
   * 指定期間の成績を取得
   * @param {string} appId - アプリID
   * @param {string} startDate - 開始日付（YYYY-MM-DD）
   * @param {string} endDate - 終了日付（YYYY-MM-DD）
   * @returns {Array} フィルター済み履歴
   */
  getRecordsByDateRange(appId, startDate, endDate) {
    const history = this.getHistory();
    const records = history[appId] || [];

    return records.filter(r => r.date >= startDate && r.date <= endDate);
  }

  /**
   * 履歴をクリア
   * @param {string} appId - クリア対象アプリID（省略時は全体クリア）
   */
  clearHistory(appId = null) {
    if (appId) {
      const history = this.getHistory();
      history[appId] = [];
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * 履歴をJSONでエクスポート（バックアップ用）
   * @returns {string} JSON文字列
   */
  exportHistory() {
    return JSON.stringify(this.getHistory(), null, 2);
  }

  /**
   * JSONから履歴をインポート
   * @param {string} jsonData - JSON文字列
   */
  importHistory(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('履歴のインポートに失敗しました:', error);
    }
  }

  /**
   * サーバーに履歴を同期（将来のDB保存対応）
   * @private
   */
  _syncToServer(appId, record) {
    // 将来的に、結果をサーバーに送信する処理を実装
    // fetch('/rireki/api/save', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ appId, record })
    // }).catch(err => console.log('オフライン（履歴はローカルに保存）'));
  }

  // ヘルパー関数
  getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  getCurrentTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }
}

// グローバルに初期化
const historyManager = new HistoryManager();
