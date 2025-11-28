/**
 * PWA 初期化スクリプト
 * Service Worker登録とInstall prompt処理
 */

// Service Worker登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Install prompt処理
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // ブラウザのデフォルト動作を防ぐ
    e.preventDefault();
    // インストールプロンプトを保存
    deferredPrompt = e;
    
    // カスタムインストールボタンを表示（必要に応じて）
    showInstallPrompt();
});

function showInstallPrompt() {
    // アプリホーム画面にインストールボタンを表示したい場合はここで実装
    // const installBtn = document.getElementById('install-btn');
    // if (installBtn) {
    //     installBtn.style.display = 'block';
    //     installBtn.addEventListener('click', () => {
    //         if (deferredPrompt) {
    //             deferredPrompt.prompt();
    //             deferredPrompt.userChoice.then((choiceResult) => {
    //                 if (choiceResult.outcome === 'accepted') {
    //                     console.log('App installed');
    //                 }
    //                 deferredPrompt = null;
    //             });
    //         }
    //     });
    // }
}

// インストール後のイベント
window.addEventListener('appinstalled', () => {
    console.log('App installed successfully');
    deferredPrompt = null;
});

// オンライン/オフライン状態の監視
window.addEventListener('online', () => {
    console.log('App is online');
});

window.addEventListener('offline', () => {
    console.log('App is offline');
});
