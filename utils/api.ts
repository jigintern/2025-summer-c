import { PostSubmission, QueryParams } from "../types/postData.ts";

/**
 * モックデータ用のデータベース（配列）
 */
const mockPhotoDatabase: PostSubmission[] = [
    {
        name: '初期データ（鯖江市）',
        coordinate: { x: 136.18, y: 35.94, h: 0.01, w: 0.01, angle: 0 },
        decade: { lte: 2000, gt: 1990 },
        comment: '西山公園のつつじの写真です。',
        photos: ['nishiyama_park.jpg'],
        thread: [],
        created_at: '2025-05-15T10:00:00Z',
    },
    {
        name: '初期データ2（鯖江市）',
        coordinate: { x: 136.19, y: 35.94, h: 0.001, w: 0.001, angle: 100 },
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
        const inTime = itemYear <= params.year;
        const inBounds = item.coordinate.x >= params.x && item.coordinate.x <= params.x2 &&
                         item.coordinate.y >= params.y && item.coordinate.y <= params.y2;
        return inTime && inBounds;
    });

    return Promise.resolve(filteredData);
};