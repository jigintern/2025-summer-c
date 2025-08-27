import { PostSubmission, QueryParams } from "../types/postData.ts";

/**
 * モックデータ用のデータベース（配列）
 */
const mockPhotoDatabase: PostSubmission[] = [
    {
        name: '初期データ（鯖江市）',
        geometry: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [ 136.175414, 35.945945 ],
                        [ 136.175414, 35.950496 ],
                        [ 136.179, 35.952 ], // 座標を修正して非矩形に
                        [ 136.182754, 35.950496 ],
                        [ 136.182754, 35.945945 ],
                        [ 136.175414, 35.945945 ]
                    ]
                ]
            }
        },
        decade: { lte: 2000, gt: 1990 },
        comment: '西山公園のつつじの写真です。',
        photos: ['nishiyama_park.jpg'],
        thread: [],
        created_at: '2025-05-15T10:00:00Z',
    },
];


const BASE_URL = 'http://localhost:8000';

/**
 * データをサーバーにPOST送信する（モック版）
 * @param data - 投稿するデータ
 * @returns 成功したことを示すfetchのレスポンス（のモック）
 */
export const postJson = (data: PostSubmission): Promise<Response> => {
    console.log('【MOCK】以下のデータをサーバーに送信しました:', data);

    // モックデータベースにデータを追加
    mockPhotoDatabase.push(data);

    // 成功時のレスポンスをシミュレートして返す
    const mockResponse = new Response(JSON.stringify({ message: 'Upload successful' }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
    });
    return Promise.resolve(mockResponse);
};

/**
 * クエリパラメータを使ってデータを検索する（モック版）
 * @param params - 検索用のクエリパラメータ
 * @returns 検索結果のデータ
 */
export const queryJson = (params: QueryParams): Promise<PostSubmission[]> => {
    console.log('【MOCK】以下のパラメータでデータを検索しました:', params);

    const filteredData = mockPhotoDatabase.filter(item => {
        const itemYear = new Date(item.created_at).getFullYear();
        // 時間範囲のフィルタリング（空間クエリはモックのため未実装）
        return itemYear <= params.year;
    });
    
    // フィルタリングされたデータを返すように修正
    return Promise.resolve(filteredData);
};