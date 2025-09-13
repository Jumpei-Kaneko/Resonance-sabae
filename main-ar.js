document.addEventListener('DOMContentLoaded', () => {
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
    const apiUrl = '【ここに、あなたのサーバーAPIのURLを記入】';
    let currentKoenSoundUrl = null;

    koenTarget.addEventListener("targetFound", () => {
        console.log("公園パネル 発見");
        if (!currentKoenSoundUrl) {
            console.log("サーバーに音をリクエストします...");
            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (data && data.soundUrl) {
                        console.log("音が見つかりました:", data.soundUrl);
                        currentKoenSoundUrl = data.soundUrl;
                        koenAudio.src = currentKoenSoundUrl;
                        koenAudio.play().catch(e => console.error("公園の音声再生エラー:", e));
                    } else {
                        console.log("現在、聴ける音はありません。");
                    }
                })
                .catch(error => {
                    console.error('APIエラー:', error);
                });
        } else {
            koenAudio.play().catch(e => console.error("公園の音声再生エラー:", e));
        }
    });

    koenTarget.addEventListener("targetLost", () => {
        console.log("公園パネル 消失");
        koenAudio.pause();
    });
    
    koenAudio.addEventListener('ended', () => {
        console.log("誰かの音が終わりました。");
        currentKoenSoundUrl = null;
        koenAudio.removeAttribute('src'); 
    });

    // --- ARの起動処理 ---
    const arStartButton = document.getElementById('ar-start-button');

    // START ARボタンがクリックされたら、ARを開始する
    arStartButton.addEventListener('click', () => {
        // ★★★ この瞬間にARシステムを取得する ★★★
        const arSystem = sceneEl.systems['mindar-image-system'];
        
        // ローディング画面を非表示にし、ARシステムを開始
        loader.style.display = 'none';
        arSystem.start(); // これでarSystemが空っぽでなくなる
    });
});
