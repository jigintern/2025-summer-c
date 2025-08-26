import { postJson, queryJson } from '../../utils/api';
import { PostSubmission, QueryParams, Decade } from '../../types/postData';

// --- DOM要素を取得 ---
const postForm = document.getElementById('post-form') as HTMLFormElement;
const queryForm = document.getElementById('query-form') as HTMLFormElement;
const postResultEl = document.getElementById('post-result')!;
const queryResultEl = document.getElementById('query-result')!;

// --- 初期値設定 ---
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
(document.getElementById('created_at') as HTMLInputElement).value = now.toISOString().slice(0, 16);

// --- イベントリスナー ---

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Decadeは任意項目のため、入力がある場合のみオブジェクトを作成
    const lteInput = (document.getElementById('decade_lte') as HTMLInputElement).value;
    const gtInput = (document.getElementById('decade_gt') as HTMLInputElement).value;
    let decade: Decade | undefined = undefined;
    if (lteInput && gtInput) {
        decade = {
            lte: parseInt(lteInput, 10),
            gt: parseInt(gtInput, 10),
        };
    }

    // photosはカンマ区切りの文字列を配列に変換
    const photosRaw = (document.getElementById('content_photos') as HTMLInputElement).value;
    const photos = photosRaw ? photosRaw.split(',').map(item => item.trim()) : [];

    // 送信するデータオブジェクトを構築
    const data: PostSubmission = {
        name: (document.getElementById('name') as HTMLInputElement).value,
        coordinate: {
            x: parseFloat((document.getElementById('coord_x') as HTMLInputElement).value),
            y: parseFloat((document.getElementById('coord_y') as HTMLInputElement).value),
            h: 0, w: 0, angle: 0, // HTMLにないので仮の値
        },
        decade: decade, // 入力があればオブジェクト、なければundefined
        content: {
            text: (document.getElementById('content_text') as HTMLTextAreaElement).value,
            photos: photos,
        },
        thread: [], // HTMLにないので空の配列
        created_at: new Date((document.getElementById('created_at') as HTMLInputElement).value).toISOString(),
    };

    try {
        const response = await postJson(data);
        const resJson = await response.json();
        postResultEl.textContent = `ステータス: ${response.status}\n\n${JSON.stringify(resJson, null, 2)}`;
    } catch (error) {
        postResultEl.textContent = `エラーが発生しました: ${error}`;
    }
});

queryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const params: QueryParams = {
        year: parseInt((document.getElementById('year') as HTMLInputElement).value, 10),
        x: 0, y: 0, x2: 0, y2: 0, // HTMLにないので仮の値
    };
    try {
        // const result = await queryJson(params);
        // const resultJson = JSON.parse(result);
        const resultJson =  await queryJson(params);
        queryResultEl.textContent = JSON.stringify(resultJson, null, 2);
    } catch (error) {
        queryResultEl.textContent = `エラーが発生しました: ${error}`;
    }
});