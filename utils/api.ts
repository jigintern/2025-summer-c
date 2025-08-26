import { PostSubmission, QueryParams } from '../types/postData.ts';

/**
 * モックデータ用のデータベース（配列）
 */
const mockPhotoDatabase: PostSubmission[] = [
    {
        name: '初期データ（鯖江市）',
        coordinate: { x: 136.18, y: 35.94, h: 100, w: 150, angle: 0 },
        decade: { lte: 2000, gt: 1990 },
        content: {
            text: '西山公園のつつじの写真です。',
            photos: ['nishiyama_park.jpg'],
        },
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
export const postJson = async (data: PostSubmission): Promise<Response> => {
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
 * @returns 検索結果のデータ（JSON文字列）
 */
export const queryJson = async (params: QueryParams): Promise<PostSubmission[]> => {
    console.log('【MOCK】以下のパラメータでデータを検索しました:', params);

    // ここにサーバーに対してgetを送信する処理

    // ここはサーバー側の処理
    // パラメータに基づいてモックデータをフィルタリング（ここではyearを簡易的にチェック）
    const filteredData = mockPhotoDatabase.filter(item => {
        const itemYear = new Date(item.created_at).getFullYear();
        return itemYear <= params.year;
    });
    const res = JSON.stringify(filteredData, null, 2) // サーバーからデータが返ってきたと思うことにする

    // :以後に返り血の型を入れる
    /*
    const parsedData:  = JSON.parse(res);

    // 検索結果をJSON文字列にして返す
    return Promise.resolve(parsedData);
    */
    return filteredData;

    //return Promise.resolve(JSON.stringify(filteredData, null, 2));

};