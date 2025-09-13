// DOM要素が読み込まれたら処理を開始
document.addEventListener('DOMContentLoaded', () => {
    // 必要な要素を取得
    const sceneEl = document.querySelector('a-scene');
    const loader = document.getElementById('loader');
    
    // --- 街パネル（私）の制御 ---
    const machiTarget = document.querySelector('#target-machi');
    const machiAudio = document.querySelector('#audio-machi');

    machiTarget.addEventListener("targetFound", () => {
        console.log("街パネル 発見");
        machiAudio.play().catch(e => console.error("街の音声再生エラー:", e));
    });
    machiTarget.addEventListener("targetLost", () => {
        console.log("街パネル 消失");
        machiAudio.pause();
    });

    // --- 公園パネル（誰か）の制御 ---
    const koenTarget = document.querySelector('#target-koen');
    const koenAudio = document.querySelector('#audio-koen');
    
    // APIのURL（あとでレンタルサーバーに作るPHPスクリプトのURLに書き換える）
    const apiUrl = '【ここに、あなたのサーバーAPIのURLを記入】';
    
    // 一度読み込んだ音を記録しておく変数（同じ音を何度も再生しないため）
    let currentKoenSoundUrl = null;

    koenTarget.addEventListener("targetFound", () => {
        console.log("公園パネル 発見");

        // まだ音が読み込まれていない場合のみ、サーバーに音をリクエスト
        if (!currentKoenSoundUrl) {
            console.log("サーバーに音をリクエストします...");
            
            // fetchを使って、サーバーに「未再生の音をください」とお願いする
            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // サーバーから音のURLが返ってきたら
                    if (data && data.soundUrl) {
                        console.log("音が見つかりました:", data.soundUrl);
                        currentKoenSoundUrl = data.soundUrl;
                        koenAudio.src = currentKoenSoundUrl;
                        koenAudio.play().catch(e => console.error("公園の音声再生エラー:", e));
                    } else {
                        // 未再生の音がなかった場合
                        console.log("現在、聴ける音はありません。");
                    }
                })
                .catch(error => {
                    console.error('APIエラー:', error);
                });
        } else {
            // すでに音が読み込まれていれば、そのまま再生
            koenAudio.play().catch(e => console.error("公園の音声再生エラー:", e));
        }
    });

    koenTarget.addEventListener("targetLost", () => {
        console.log("公園パネル 消失");
        koenAudio.pause();
    });
    
    // 音が最後まで再生されたら、次の認識のためにリセットする
    koenAudio.addEventListener('ended', () => {
        console.log("誰かの音が終わりました。");
        currentKoenSoundUrl = null; // URLをリセット
        koenAudio.removeAttribute('src'); // src属性を削除
    });

    // --- ARの起動処理 ---
    const arStartButton = document.getElementById('ar-start-button');
    const arSystem = sceneEl.systems['mindar-image-system'];

    // START ARボタンがクリックされたら、ARを開始する
    arStartButton.addEventListener('click', () => {
        // ローディング画面を非表示にし、ARシステムを開始
        loader.style.display = 'none';
        arSystem.start();
    });
});
