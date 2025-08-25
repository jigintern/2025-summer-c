// フォームの要素を取得
const form = document.querySelector('form');

// フォームの送信イベントを監視
await form.addEventListener('submit', async function (event) {
    // デフォルトのフォーム送信動作をキャンセル
    event.preventDefault();

    // 各idから値を取得
    const name = document.getElementById('name').value;
    const coordinateX = document.getElementById('coord_x').valueAsNumber;
    const coordinateY = document.getElementById('coord_y').valueAsNumber;
    const coordinateH = document.getElementById('coord_h').valueAsNumber;
    const coordinateW = document.getElementById('coord_w').valueAsNumber;
    const coordinateAngle = document.getElementById('coord_angle').valueAsNumber;
    const decadeLte = document.getElementById('decade_lte').valueAsNumber;
    const decadeGt = document.getElementById('decade_gt').valueAsNumber;
    const comment = document.getElementById('comment').value;
    // photosはカンマ区切りで配列に変換
    const photos = document.getElementById('photos').value.split(',').map(item => item.trim());
    const threadId = document.getElementById('thread_id').valueAsNumber;
    const threadComment = document.getElementById('thread_comment').value;
    const threadCreatedAt = document.getElementById('thread_created_at').value;
    const createdAt = document.getElementById('created_at').value;


    // 取得した値をJSONオブジェクトの形式にまとめる
    const jsonData = {
        name: name,
        coordinate: {
            x: coordinateX,
            y: coordinateY,
            h: coordinateH,
            w: coordinateW,
            angle: coordinateAngle
        },
        decade: {
            lte: decadeLte,
            gt: decadeGt
        },
        comment: comment,
        photos: photos,
        thread: [
            {
                id: threadId,
                comment: threadComment,
                created_at: threadCreatedAt
            }
        ],
        created_at: createdAt
    };

    // 結果をコンソールに出力
    console.log(jsonData);

    // JSON文字列に変換して出力
    console.log(JSON.stringify(jsonData, null, 2));

    const response = await fetch("http://localhost:8000/post-json",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify(jsonData, null, 2)
    });
    testres.innerText = response.statusText;
    // ここで取得した`jsonData`をサーバーに送信するなどの処理を行う
});

queryJson.onclick = async () => {
    let year = document.getElementById('year').value;
    let x = document.getElementById('x').value;
    let y = document.getElementById('y').value;
    let x2 = document.getElementById('x2').value;
    let y2 = document.getElementById('y2').value;
    resp2.innerText = "aaaa";
    const response = await fetch("http://localhost:8000/query-json?year=" + year + "&x=" + x + "&y=" + y + "&x2=" + x2 + "&y2=" + y2, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
    });
    resp3.innerText = await response.text();
};